const baseUrl = 'https://aiida.materialscloud.org/mc3d/api/v4/nodes/page/';
const urlEnd = '&orderby=-ctime';
const processUrlEnd = '&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&orderby=-ctime';

const fetchPageData = async (fullType, page, pageSize = 50) => {
  const isProcessType = fullType.includes('process');
  const fullTypeEncoded = fullType.replace(/\|/g, '').replace(/%/g, '');
  const url = `${baseUrl}${page}?&perpage=${pageSize}&full_type="${fullTypeEncoded}25%7C"${isProcessType ? processUrlEnd : urlEnd}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.nodes;
  } catch (error) {
    console.error(`Error fetching data for ${fullType} on page ${page}:`, error);
    return [];
  }
};

export default fetchPageData;
