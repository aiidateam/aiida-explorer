import React from "react";
import Explorer from "./Explorer";

// needed to make mc-react-library components not shit the bed.
// should be moved into the Explorer component
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const MC2D = "https://aiida.materialscloud.org/mc2d/api/v4";
  const MC2D_node = "030bf271-2c94-4d93-8314-7f82f271bd44";

  const MC3D = "https://aiida.materialscloud.org/mc3d-pbe-v1/api/v4";
  const MC3D_node = "03b0d538-dbb6-4b9d-8ce5-da8173155104";

  const twodtopo = "https://aiida.materialscloud.org/2dtopo/api/v4";
  const twodtopo_node = "03b0d538-dbb6-4b9d-8ce5-da8173155104";

  return <Explorer baseUrl={twodtopo} startingNode={twodtopo_node} />;
}

export default App;
