import * as React from "react";
import Dropzone from "./Dropzone";

export default function Main() {
  return (
    <main className="main main--hero">
      {<h1>Загрузите XML акта сдачи-приёмки и получите PDF бесплатно</h1>}
      <Dropzone />
      <p className="main__paragraph main__paragraph--hero"></p>
    </main>
  );
}
