import React, { useEffect, useRef } from 'react';
import { createBZVisualizer } from "brillouinzone-visualizer";

const Brillouinzone = ({ data }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && data) {
            createBZVisualizer(containerRef.current, data, {
                showAxes: false,
                showBVectors: false,
                showPathpoints: true,
                disableInteractOverlay: true, 
            });
        }
    }, [data]);

    return <div ref={containerRef} id="bzvis" />;
};

export default Brillouinzone;