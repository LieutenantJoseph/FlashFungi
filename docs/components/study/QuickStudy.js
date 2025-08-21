(function() {
    'use strict';
    
    window.QuickStudy = function QuickStudy(props) {
        // Simply delegate to SharedFlashcard with mode='quick'
        return React.createElement(window.SharedFlashcard, {
            ...props,
            mode: 'quick'
        });
    };
    
    console.log('✅ QuickStudy component updated to use SharedFlashcard');
    
})();