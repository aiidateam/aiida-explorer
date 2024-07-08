import React, { useState, useEffect } from 'react';

const ComponentVisualizer = ({ uuid, moduleName }) => {
    const [data, setData] = useState(null);
    const [compoundsData, setCompoundsData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${uuid}/download?download_format=cif&download=false`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const json = await response.json();
                if (!json.data || !json.data.download || !json.data.download.data || json.data.download.data.trim().length === 0) {
                    throw new Error('Empty or invalid response');
                }
                setData(json.data.download.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        };

        // const fetchCompoundsData = async () => {
        //     try {
        //         const response = await fetch(`https://www.materialscloud.org/mcloud/api/v2/discover/mc3d/compounds`);
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok');
        //         }
        //         const json = await response.json();
        //         setCompoundsData(json);
        //     } catch (error) {
        //         console.error('Error fetching compounds data:', error);
        //         setError(error.message);
        //     }
        // };

        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchData()]);
            setLoading(false);
        };

        fetchAllData();
    }, [uuid, moduleName]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-center h-screen">
                <div className='m-auto'>
                    <StructureVisualizer cifText={data} />
                </div>
            </div>
            {/* <div>
                <h2>Compounds Data</h2>
                <pre>{JSON.stringify(compoundsData, null, 2)}</pre>
            </div> */}
        </div>
    );
}

export default ComponentVisualizer;
