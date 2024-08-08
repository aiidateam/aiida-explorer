import React, { useState, useEffect } from 'react';
import { JsonViewer } from '@textea/json-viewer';

const ExtraContent = ({ uuid, apiUrl }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${apiUrl}/nodes/${uuid}/contents/extras`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setData(data))
            .catch(error => setError(error.message));
    }, [apiUrl, uuid]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data) {
        return <div></div>;
    }

    return (
        <div className='p-2 border-2 border-gray-50 rounded shadow-md'>
            <JsonViewer
            value={data}
            theme="githubLight"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            rootName = {false}
            // rootName={null}
          />
        </div>
    );
}

export default ExtraContent;
