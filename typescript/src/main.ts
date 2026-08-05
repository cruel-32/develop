import "./index.css";
import { mountLayout } from "./layout";
import { registerRoute, initRouter } from "./router";
import { updatePageIndex } from "./pageIndex";

import { render as homeRender } from "./pages/home/Home";
import { render as returnBranchesRender } from "./pages/version/v58/returnBranches";
import { render as erasableSyntaxOnlyRender } from "./pages/version/v58/erasableSyntaxOnly";
import { render as importDeferRender } from "./pages/version/v59/importDefer";
import { render as arraybufferSplitRender } from "./pages/version/v59/arraybufferSplit";
import { render as strictByDefaultRender } from "./pages/version/v60/strictByDefault";
import { render as mapGetOrInsertRender } from "./pages/version/v60/mapGetOrInsert";
import { render as templateLiteralUnicodeRender } from "./pages/version/v70/templateLiteralUnicode";
import { render as nativeCompilerRender } from "./pages/version/v70/nativeCompiler";
import { render as crudDemoRender } from "./pages/crud/CrudDemoPage";

registerRoute("", homeRender);
registerRoute("version/v5.8/return-branches", returnBranchesRender);
registerRoute("version/v5.8/erasable-syntax-only", erasableSyntaxOnlyRender);
registerRoute("version/v5.9/import-defer", importDeferRender);
registerRoute("version/v5.9/arraybuffer-split", arraybufferSplitRender);
registerRoute("version/v6.0/strict-by-default", strictByDefaultRender);
registerRoute("version/v6.0/map-get-or-insert", mapGetOrInsertRender);
registerRoute("version/v7.0/template-literal-unicode", templateLiteralUnicodeRender);
registerRoute("version/v7.0/native-compiler", nativeCompilerRender);
registerRoute("crud-demo", crudDemoRender);

const root = document.querySelector<HTMLDivElement>("#app")!;
const { contentEl, pageIndexEl } = mountLayout(root);

initRouter(contentEl, () => updatePageIndex(contentEl, pageIndexEl));
