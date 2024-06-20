import React, { useState , useCallback } from 'react';
import { useParams } from 'react-router-dom';
// import ReactFlow, { 
//     MiniMap, 
//     Controls, 
//     Background, 
//     ReactFlowProvider ,
//     useNodesState,
//     useEdgesState,
//     addEdge,
// } from 'reactflow';
import 'tailwindcss/tailwind.css';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom'; 
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { stackoverflowLight} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Attributes from './Attributes';
import Files from './FIles';
import Contents from './Contents';
import GraphBrowser from './GraphBrowser';
import BrowserSelection from '../BrowserSelection';

const DetailsPage = ({moduleName}) => {
  const { uuid } = useParams();
  const [view, setView] = useState('raw');
  const navigate = useNavigate();
  // const nodeData = {
  //   data: {
  //     attributes: {
  //       CONTROL: {
  //         calculation: "scf",
  //         etot_conv_thr: 0.00036,
  //         forc_conv_thr: 0.0001,
  //         max_seconds: 41040.0,
  //         restart_mode: "from_scratch",
  //         tprnfor: true,
  //         tstress: true
  //       },
  //       ELECTRONS: {
  //         conv_thr: 7.2e-9,
  //         electron_maxstep: 80,
  //         mixing_beta: 0.4
  //       },
  //       SYSTEM: {
  //         degauss: 0.01,
  //         ecutrho: 400.0,
  //         ecutwfc: 50.0,
  //         nbnd: 144,
  //         nosym: false,
  //         occupations: "smearing",
  //         smearing: "cold"
  //       }
  //     }
  //   }
  // };

  // const initialNodes = [
  //   { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 50 }, style: { background: '#A5D6A7', color: '#333', border: '1px solid #333' } },
  //   { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 }, style: { background: '#C8E6C9' } },
  //   { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 200 }, style: { background: '#C8E6C9' } },
  //   { id: '4', data: { label: 'Node 4' }, position: { x: 250, y: 350 }, style: { background: '#FFCC80' } },
  // ];

  // const initialEdges = [
  //   { id: 'e1-2', source: '1', target: '2', animated: true },
  //   { id: 'e1-3', source: '1', target: '3', animated: true },
  //   { id: 'e3-4', source: '3', target: '4', animated: true },
  // ];

  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges],
  // );

  return (
    <div className="flex h-[100vh] mx-4 p-5">
      <div className="w-1/2 p-6 border-2 mr-2 border-gray-200 rounded-lg relative bg-gray-50">
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 bg-blue-500 absolute top-0 left-0 text-white rounded-tl-md rounded-br-md"
          onClick={() => navigate(-1)}
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M244 400L100 256l144-144M120 256h292"/></svg>
        </button>
      </div>
      <div className='border-2 border-gray-300 absolute top-[-1rem] left-[40.5%] px-3 py-2 bg-green-200 z-10 align-middle items-center'>
        <h1 className="text-xl font-semibold text-center">Node Preview</h1>
      </div>
        <div className="flex justify-center mb-4">
          <button
            className={`px-6 shadow-lg py-2 mx-2 rounded-lg ${view === 'raw' ? 'bg-blue-400 text-white' : 'bg-blue-100'}`}
            onClick={() => setView('raw')}
          >
            Raw
          </button>
          <button
            className={`px-6 shadow-lg py-2 mx-2 rounded-lg ${view === 'rich' ? 'bg-blue-400  text-white' : 'bg-blue-100'}`}
            onClick={() => setView('rich')}
          >
            Rich
          </button>
        </div>
        <div className="overflow-auto bg-white p-4 rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-[90%] ">
          {view === 'raw' ? (
            <div>
            <Files moduleName={moduleName} uuid={uuid} />
            <div classname="col-span-2 ">
                <span className='font-semibold font-mono mb-0'>Node Metadata :</span>
              <Attributes moduleName={moduleName} uuid={uuid}/>
            </div>
            {/* <Contents moduleName={moduleName} uuid={uuid} /> */}
          </div>
          ) : (
            <div>
              <div>
            <Files moduleName={moduleName} uuid={uuid} />
            {/* <div classname="col-span-2 ">
                <span className='font-semibold font-mono mb-0'>Node Metadata :</span>
              <Attributes moduleName={moduleName} uuid={uuid}/>
            </div> */}
            <Contents moduleName={moduleName} uuid={uuid} />
          </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-1/2 p-6 relative border-2 ml-2 rounded-lg border-gray-200">
      <div className='border-2 border-gray-300 absolute top-[-1rem] left-[40.5%] px-3 py-2 bg-green-200 z-10 align-middle items-center'>
        <h1 className="text-xl font-semibold text-center">Graph Preview</h1>
      </div >
      <div className='h-full w-full'>
          <BrowserSelection uuid={uuid} moduleName={moduleName} />
      {/* <GraphBrowser uuid={uuid} moduleName={moduleName} /> */}
      </div>
        {/* <ReactFlowProvider>
          <ReactFlow 
          style={{ width: '100%', height: '100%' }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}>
            <Controls />
            <Background variant="dots" gap={16} size={1} />
          </ReactFlow>
          <div className="absolute bottom-4 right-4 p-2">
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'input') return '#C8E6C9';
                if (n.type === 'default') return '#A5D6A7';
                if (n.type === 'output') return '#FFCC80';
                return '#eee';
              }}
              style={{ width: 200, height: 120 }}
            />
          </div>
        <DownloadButton />
        </ReactFlowProvider> */}
      </div>
    </div>
  );
};

export default DetailsPage;
