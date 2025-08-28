// api/admin.js - Enhanced Admin API Endpoint with Pagination and Filtering
// This should replace the existing /api/admin endpoint

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://oxgedcncrettasrbmwsl.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2VkY25jcmV0dGFzcmJtd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDY4NjQsImV4cCI6MjA2OTQ4Mjg2NH0.mu0Cb6qRr4cja0vsSzIuLwDTtNFuimWUwNs_JbnO3Pg';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET':
                return await handleGet(req, res);
            case 'POST':
                return await handlePost(req, res);
            case 'PATCH':
                return await handlePatch(req, res);
            case 'DELETE':
                return await handleDelete(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
}

// GET - Fetch specimens with pagination and filtering
async function handleGet(req, res) {
    const {
        page = 1,
        limit = 25,
        search = '',
        status = 'all',
        dna_sequenced = 'all',
        family = 'all',
        genus = 'all',
        sort_by = 'created_at',
        sort_order = 'desc',
        include_photos = false
    } = req.query;

    try {
        // Start building the query
        let query = supabase
            .from('specimens')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (dna_sequenced !== 'all') {
            query = query.eq('dna_sequenced', dna_sequenced === 'yes');
        }

        if (family !== 'all' && family) {
            query = query.eq('family', family);
        }

        if (genus !== 'all' && genus) {
            query = query.eq('genus', genus);
        }

        // Apply search (using OR conditions for multiple fields)
        if (search) {
            // For full-text search (if search_vector column exists)
            // query = query.textSearch('search_vector', search);
            
            // Fallback to ILIKE search on multiple columns
            const searchPattern = `%${search}%`;
            query = query.or(
                `species_name.ilike.${searchPattern},` +
                `common_name.ilike.${searchPattern},` +
                `location.ilike.${searchPattern},` +
                `family.ilike.${searchPattern},` +
                `genus.ilike.${searchPattern}`
            );
        }

        // Apply sorting
        const isAscending = sort_order === 'asc';
        query = query.order(sort_by, { ascending: isAscending });

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit) - 1;
        query = query.range(startIndex, endIndex);

        // Execute query
        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        // If include_photos is true, fetch photos for each specimen
        let specimens = data;
        if (include_photos === 'true' && specimens.length > 0) {
            // Fetch photos from iNaturalist for specimens that have selected_photos
            specimens = await Promise.all(specimens.map(async (specimen) => {
                if (specimen.selected_photos && specimen.selected_photos.length > 0) {
                    // In production, you would fetch actual photo URLs from iNaturalist
                    // For now, constructing URLs based on photo IDs
                    specimen.photo_urls = specimen.selected_photos.map(photoId => ({
                        id: photoId,
                        thumb: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/square.jpg`,
                        medium: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/medium.jpg`,
                        large: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/large.jpg`
                    }));
                }
                return specimen;
            }));
        }

        // Get aggregate statistics
        const statsQuery = await supabase
            .from('specimens')
            .select('status, dna_sequenced', { count: 'exact', head: false });
        
        const stats = {
            total: count || 0,
            pending: statsQuery.data?.filter(s => s.status === 'pending').length || 0,
            approved: statsQuery.data?.filter(s => s.status === 'approved').length || 0,
            dna_verified: statsQuery.data?.filter(s => s.dna_sequenced).length || 0
        };

        // Get filter options (unique families and genera)
        const familiesQuery = await supabase
            .from('specimens')
            .select('family')
            .not('family', 'is', null);
        
        const generaQuery = await supabase
            .from('specimens')
            .select('genus')
            .not('genus', 'is', null);

        const families = [...new Set(familiesQuery.data?.map(s => s.family) || [])].sort();
        const genera = [...new Set(generaQuery.data?.map(s => s.genus) || [])].sort();

        return res.status(200).json({
            specimens: specimens,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            },
            stats: stats,
            filterOptions: {
                families: families,
                genera: genera
            }
        });

    } catch (error) {
        console.error('Error fetching specimens:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch specimens',
            details: error.message 
        });
    }
}

// POST - Create new specimen
async function handlePost(req, res) {
    const specimen = req.body;

    try {
        // Validate required fields
        if (!specimen.species_name || !specimen.inaturalist_id) {
            return res.status(400).json({ 
                error: 'Missing required fields: species_name and inaturalist_id' 
            });
        }

        // Set defaults
        const newSpecimen = {
            ...specimen,
            status: specimen.status || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('specimens')
            .insert([newSpecimen])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return res.status(201).json({
            message: 'Specimen created successfully',
            specimen: data
        });

    } catch (error) {
        console.error('Error creating specimen:', error);
        return res.status(500).json({ 
            error: 'Failed to create specimen',
            details: error.message 
        });
    }
}

// PATCH - Update specimen (approve/reject/edit)
async function handlePatch(req, res) {
    const { 
        specimenId, 
        status, 
        notes, 
        selectedPhotoIds,
        ...otherUpdates 
    } = req.body;

    if (!specimenId) {
        return res.status(400).json({ error: 'Specimen ID is required' });
    }

    try {
        // Build update object
        const updates = {
            ...otherUpdates,
            updated_at: new Date().toISOString()
        };

        if (status) {
            updates.status = status;
        }

        if (notes !== undefined) {
            updates.admin_notes = notes;
        }

        if (selectedPhotoIds) {
            updates.selected_photos = selectedPhotoIds;
        }

        // If approving, set approval timestamp
        if (status === 'approved') {
            updates.approved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('specimens')
            .update(updates)
            .eq('id', specimenId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // If specimen was approved, check if field guide should be auto-created
        if (status === 'approved') {
            await checkAndCreateFieldGuide(data);
        }

        return res.status(200).json({
            message: 'Specimen updated successfully',
            specimen: data
        });

    } catch (error) {
        console.error('Error updating specimen:', error);
        return res.status(500).json({ 
            error: 'Failed to update specimen',
            details: error.message 
        });
    }
}

// DELETE - Delete specimen
async function handleDelete(req, res) {
    const { specimenId } = req.body;

    if (!specimenId) {
        return res.status(400).json({ error: 'Specimen ID is required' });
    }

    try {
        const { error } = await supabase
            .from('specimens')
            .delete()
            .eq('id', specimenId);

        if (error) {
            throw error;
        }

        return res.status(200).json({
            message: 'Specimen deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting specimen:', error);
        return res.status(500).json({ 
            error: 'Failed to delete specimen',
            details: error.message 
        });
    }
}

// Helper function to check and create field guide entry
async function checkAndCreateFieldGuide(specimen) {
    try {
        // Check if field guide already exists for this species
        const { data: existingGuide } = await supabase
            .from('field_guides')
            .select('id')
            .eq('species_name', specimen.species_name)
            .single();

        if (!existingGuide) {
            // Create a basic field guide entry
            const fieldGuide = {
                species_name: specimen.species_name,
                common_name: specimen.common_name,
                family: specimen.family,
                genus: specimen.genus,
                description: '',
                ecology: '',
                reference_photos: specimen.selected_photos ? 
                    specimen.selected_photos.slice(0, 6).map(photoId => ({
                        type: 'inaturalist',
                        url: `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/medium.jpg`,
                        inaturalist_id: specimen.inaturalist_id,
                        source: `Specimen ${specimen.inaturalist_id}`
                    })) : [],
                hints: [],
                diagnostic_features: {
                    cap: {},
                    gills_pores: {},
                    stem: {},
                    spore_print: {},
                    chemical_reactions: {}
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await supabase
                .from('field_guides')
                .insert([fieldGuide]);
                
            console.log(`Field guide created for species: ${specimen.species_name}`);
        }
    } catch (error) {
        console.error('Error creating field guide:', error);
        // Non-critical error, don't throw
    }
}

// Additional endpoint for bulk operations (future enhancement)
export async function bulkUpdate(req, res) {
    const { specimenIds, updates } = req.body;

    if (!specimenIds || !Array.isArray(specimenIds) || specimenIds.length === 0) {
        return res.status(400).json({ error: 'Specimen IDs array is required' });
    }

    try {
        const { data, error } = await supabase
            .from('specimens')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .in('id', specimenIds)
            .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            message: `${data.length} specimens updated successfully`,
            specimens: data
        });

    } catch (error) {
        console.error('Error in bulk update:', error);
        return res.status(500).json({ 
            error: 'Failed to bulk update specimens',
            details: error.message 
        });
    }
}