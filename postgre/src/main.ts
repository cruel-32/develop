import "./index.css";
import { mountLayout } from "./layout";
import { registerRoute, initRouter } from "./router";
import { updatePageIndex } from "./pageIndex";

import { render as homeRender } from "./pages/home/Home";
import { render as selectRender } from "./pages/basics/select";
import { render as insertRender } from "./pages/basics/insert";
import { render as updateRender } from "./pages/basics/update";
import { render as deleteRender } from "./pages/basics/delete";
import { render as innerJoinRender } from "./pages/joins/innerJoin";
import { render as outerJoinRender } from "./pages/joins/outerJoin";
import { render as crossSelfJoinRender } from "./pages/joins/crossSelfJoin";
import { render as groupByAggregateRender } from "./pages/aggregation/groupByAggregate";
import { render as stringFunctionsRender } from "./pages/aggregation/stringFunctions";
import { render as dateFunctionsRender } from "./pages/aggregation/dateFunctions";
import { render as windowFunctionsRender } from "./pages/aggregation/windowFunctions";
import { render as plpgsqlFunctionsRender } from "./pages/procedures/plpgsqlFunctions";
import { render as storedProceduresRender } from "./pages/procedures/storedProcedures";
import { render as triggersRender } from "./pages/procedures/triggers";

registerRoute("", homeRender);
registerRoute("basics/select", selectRender);
registerRoute("basics/insert", insertRender);
registerRoute("basics/update", updateRender);
registerRoute("basics/delete", deleteRender);
registerRoute("joins/inner-join", innerJoinRender);
registerRoute("joins/outer-join", outerJoinRender);
registerRoute("joins/cross-self-join", crossSelfJoinRender);
registerRoute("aggregation/group-by-aggregate", groupByAggregateRender);
registerRoute("aggregation/string-functions", stringFunctionsRender);
registerRoute("aggregation/date-functions", dateFunctionsRender);
registerRoute("aggregation/window-functions", windowFunctionsRender);
registerRoute("procedures/plpgsql-functions", plpgsqlFunctionsRender);
registerRoute("procedures/stored-procedures", storedProceduresRender);
registerRoute("procedures/triggers", triggersRender);

const root = document.querySelector<HTMLDivElement>("#app")!;
const { contentEl, pageIndexEl } = mountLayout(root);

initRouter(contentEl, () => updatePageIndex(contentEl, pageIndexEl));
