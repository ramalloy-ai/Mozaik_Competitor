import { useMemo, useState } from "react";
import { Controls } from "./components/Controls";
import { CutlistTable } from "./components/CutlistTable";
import { Viewer } from "./components/Viewer";
import { DEFAULT_BASE_CABINET, buildBaseCabinet } from "./domain/baseCabinet";
import { buildCutlist } from "./domain/cutlist";

export function App() {
  const [spec, setSpec] = useState(DEFAULT_BASE_CABINET);

  const cabinet = useMemo(() => buildBaseCabinet(spec), [spec]);
  const cutlist = useMemo(() => buildCutlist([cabinet]), [cabinet]);

  return (
    <div className="app">
      <div className="topbar">
        <span className="brand">Cabinet Studio</span>
        <span className="tag">parametric base cabinet · live cutlist</span>
      </div>
      <Controls spec={spec} onChange={setSpec} />
      <div className="viewer">
        <Viewer cabinet={cabinet} />
      </div>
      <CutlistTable rows={cutlist} />
    </div>
  );
}
