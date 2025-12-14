// Sources Tab Component for Field Guide Editor
// Allows URL input for species information extraction via AI
import React, { useState, useEffect } from 'react';

const SourcesTab = ({ species, fieldGuide, onUpdateFieldGuide }) => {
  const [sources, setSources] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    loadSources();
  }, [species]);

  const loadSources = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/field_guide_sources?species_name=eq.${encodeURIComponent(species.species_name)}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return;

    setError(null);
    setProcessing(true);

    try {
      // Save the source first
      const sourceData = {
        species_name: species.species_name,
        source_type: 'url',
        source_url: newUrl.trim(),
        status: 'pending',
        added_date: new Date().toISOString()
      };

      const saveResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/field_guide_sources`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(sourceData)
        }
      );

      if (!saveResponse.ok) {
        throw new Error('Failed to save source');
      }

      const savedSource = await saveResponse.json();
      setSources([...sources, savedSource[0]]);
      setNewUrl('');
      
      // Add to processing queue
      await addToProcessingQueue(savedSource[0].id);

    } catch (error) {
      setError(`Error adding source: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const addToProcessingQueue = async (sourceId) => {
    try {
      await fetch('/api/admin/queue-source-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sourceId })
      });
    } catch (error) {
      console.error('Error adding to processing queue:', error);
    }
  };

  const processBatchSources = async () => {
    const pendingSources = sources.filter(s => s.status === 'pending');
    if (pendingSources.length === 0) {
      setError('No pending sources to process');
      return;
    }

    setProcessingBatch(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/process-sources-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          species_name: species.species_name,
          sourceIds: pendingSources.map(s => s.id)
        })
      });

      if (!response.ok) {
        throw new Error('Batch processing failed');
      }

      const result = await response.json();
      
      // Update extracted data
      setExtractedData(result.extractedData);
      
      // Reload sources to get updated statuses
      await loadSources();

      // Auto-apply to field guide if successful
      if (result.extractedData) {
        applyExtractedData(result.extractedData);
      }

    } catch (error) {
      setError(`Batch processing error: ${error.message}`);
    } finally {
      setProcessingBatch(false);
    }
  };

  const applyExtractedData = (data) => {
    // Merge extracted data with existing field guide data
    const updatedFieldGuide = { ...fieldGuide };
    
    // Only fill empty fields
    if (!updatedFieldGuide.description && data.description) {
      updatedFieldGuide.description = data.description;
    }
    
    if (!updatedFieldGuide.ecology && data.ecology) {
      updatedFieldGuide.ecology = data.ecology;
    }
    
    if (!updatedFieldGuide.diagnostic_features && data.diagnostic_features) {
      updatedFieldGuide.diagnostic_features = data.diagnostic_features;
    }
    
    if (!updatedFieldGuide.comparison_species && data.comparison_species) {
      updatedFieldGuide.comparison_species = data.comparison_species;
    }
    
    if (data.hints && data.hints.length > 0) {
      // Merge hints if they don't exist
      data.hints.forEach(newHint => {
        const existingHint = updatedFieldGuide.hints.find(h => h.type === newHint.type);
        if (existingHint && !existingHint.text) {
          existingHint.text = newHint.text;
        }
      });
    }
    
    // Update parent component
    onUpdateFieldGuide(updatedFieldGuide);
  };

  const deleteSource = async (sourceId) => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/field_guide_sources?id=eq.${sourceId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );

      if (response.ok) {
        setSources(sources.filter(s => s.id !== sourceId));
      }
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { bg: 'bg-yellow-900', text: 'Pending' },
      'processing': { bg: 'bg-blue-900', text: 'Processing' },
      'completed': { bg: 'bg-green-900', text: 'Completed' },
      'failed': { bg: 'bg-red-900', text: 'Failed' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className={`${badge.bg} text-white px-2 py-1 rounded text-xs`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add New Source */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Add Reference Source</h3>
        
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter URL with species information..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={processing}
          />
          <button
            onClick={handleAddUrl}
            disabled={processing || !newUrl.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              processing || !newUrl.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {processing ? 'Adding...' : 'Add Source'}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-100">
            Reference Sources ({sources.length})
          </h3>
          {sources.filter(s => s.status === 'pending').length > 0 && (
            <button
              onClick={processBatchSources}
              disabled={processingBatch}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                processingBatch
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {processingBatch ? 'Processing...' : `Process ${sources.filter(s => s.status === 'pending').length} Pending`}
            </button>
          )}
        </div>

        {sources.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No reference sources added yet. Add a URL above to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`border rounded-lg p-3 transition-all cursor-pointer ${
                  selectedSource?.id === source.id
                    ? 'border-blue-500 bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedSource(source)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(source.status)}
                      <span className="text-gray-400 text-xs">
                        Added {new Date(source.added_date).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source.source_url}
                    </a>
                    {source.extracted_content && (
                      <p className="text-gray-400 text-xs mt-1">
                        ✓ Content extracted
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSource(source.id);
                    }}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Extracted Information (Review & Apply)
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {extractedData.description && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-gray-100 bg-gray-900 p-3 rounded">
                  {extractedData.description}
                </p>
              </div>
            )}
            
            {extractedData.ecology && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ecology
                </label>
                <p className="text-gray-100 bg-gray-900 p-3 rounded">
                  {extractedData.ecology}
                </p>
              </div>
            )}
            
            {extractedData.hints && extractedData.hints.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Identification Hints
                </label>
                <div className="space-y-2">
                  {extractedData.hints.map((hint, index) => (
                    <div key={index} className="bg-gray-900 p-3 rounded">
                      <span className="text-xs text-gray-400 uppercase">
                        {hint.type}
                      </span>
                      <p className="text-gray-100 mt-1">{hint.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setExtractedData(null)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Dismiss
            </button>
            <button
              onClick={() => applyExtractedData(extractedData)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Apply to Field Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcesTab;
