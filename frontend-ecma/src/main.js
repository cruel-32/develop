import "./index.css";
import { mountLayout } from "./layout";
import { registerRoute, initRouter } from "./router";
import { updatePageIndex } from "./pageIndex";

import { render as homeRender } from "./pages/home/Home";
import { render as crudDemoRender } from "./pages/crud/CrudDemoPage";

// ES2015
import { render as letConstRender } from "./pages/version/es2015/letConst";
import { render as arrowClassRender } from "./pages/version/es2015/arrowClass";
import { render as templateDestructuringRender } from "./pages/version/es2015/templateDestructuring";
import { render as promiseRender } from "./pages/version/es2015/promise";
import { render as modulesRender } from "./pages/version/es2015/modules";

// ES2016
import { render as arrayIncludesRender } from "./pages/version/es2016/arrayIncludes";
import { render as exponentOperatorRender } from "./pages/version/es2016/exponentOperator";

// ES2017
import { render as asyncAwaitRender } from "./pages/version/es2017/asyncAwait";
import { render as objectEntriesValuesRender } from "./pages/version/es2017/objectEntriesValues";

// ES2018
import { render as objectSpreadRestRender } from "./pages/version/es2018/objectSpreadRest";
import { render as asyncIterationRender } from "./pages/version/es2018/asyncIteration";

// ES2019
import { render as arrayFlatRender } from "./pages/version/es2019/arrayFlat";
import { render as objectFromEntriesRender } from "./pages/version/es2019/objectFromEntries";

// ES2020
import { render as optionalChainingRender } from "./pages/version/es2020/optionalChaining";
import { render as bigintRender } from "./pages/version/es2020/bigint";
import { render as promiseAllSettledRender } from "./pages/version/es2020/promiseAllSettled";

// ES2021
import { render as logicalAssignmentRender } from "./pages/version/es2021/logicalAssignment";
import { render as stringReplaceAllRender } from "./pages/version/es2021/stringReplaceAll";

// ES2022
import { render as classFieldsRender } from "./pages/version/es2022/classFields";
import { render as topLevelAwaitRender } from "./pages/version/es2022/topLevelAwait";
import { render as arrayAtRender } from "./pages/version/es2022/arrayAt";

// ES2023
import { render as arrayFindLastRender } from "./pages/version/es2023/arrayFindLast";
import { render as arrayImmutableRender } from "./pages/version/es2023/arrayImmutable";

// ES2024
import { render as objectGroupByRender } from "./pages/version/es2024/objectGroupBy";
import { render as promiseWithResolversRender } from "./pages/version/es2024/promiseWithResolvers";

// ES2025
import { render as setMethodsRender } from "./pages/version/es2025/setMethods";
import { render as iteratorHelpersRender } from "./pages/version/es2025/iteratorHelpers";

registerRoute("", homeRender);

registerRoute("version/es2015/let-const", letConstRender);
registerRoute("version/es2015/arrow-class", arrowClassRender);
registerRoute("version/es2015/template-destructuring", templateDestructuringRender);
registerRoute("version/es2015/promise", promiseRender);
registerRoute("version/es2015/modules", modulesRender);

registerRoute("version/es2016/array-includes", arrayIncludesRender);
registerRoute("version/es2016/exponent-operator", exponentOperatorRender);

registerRoute("version/es2017/async-await", asyncAwaitRender);
registerRoute("version/es2017/object-entries-values", objectEntriesValuesRender);

registerRoute("version/es2018/object-spread-rest", objectSpreadRestRender);
registerRoute("version/es2018/async-iteration", asyncIterationRender);

registerRoute("version/es2019/array-flat", arrayFlatRender);
registerRoute("version/es2019/object-fromentries", objectFromEntriesRender);

registerRoute("version/es2020/optional-chaining", optionalChainingRender);
registerRoute("version/es2020/bigint", bigintRender);
registerRoute("version/es2020/promise-allsettled", promiseAllSettledRender);

registerRoute("version/es2021/logical-assignment", logicalAssignmentRender);
registerRoute("version/es2021/string-replaceall", stringReplaceAllRender);

registerRoute("version/es2022/class-fields", classFieldsRender);
registerRoute("version/es2022/top-level-await", topLevelAwaitRender);
registerRoute("version/es2022/array-at", arrayAtRender);

registerRoute("version/es2023/array-find-last", arrayFindLastRender);
registerRoute("version/es2023/array-immutable", arrayImmutableRender);

registerRoute("version/es2024/object-groupby", objectGroupByRender);
registerRoute("version/es2024/promise-withresolvers", promiseWithResolversRender);

registerRoute("version/es2025/set-methods", setMethodsRender);
registerRoute("version/es2025/iterator-helpers", iteratorHelpersRender);

registerRoute("crud-demo", crudDemoRender);

const root = document.querySelector("#app");
const { contentEl, pageIndexEl } = mountLayout(root);

initRouter(contentEl, () => updatePageIndex(contentEl, pageIndexEl));
