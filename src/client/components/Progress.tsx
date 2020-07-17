import * as React from "react";

export default function Progress({ progress }: {progress: number}) {
  return (
    <div className="progress__bar">
    <div
      className="progress__line"
      style={{ width: progress + '%' }}
    />
  </div>
  );
}
