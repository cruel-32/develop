import "./index.css";
import { mountLayout } from "./layout";
import { registerRoute, initRouter } from "./router";
import { updatePageIndex } from "./pageIndex";

import { render as homeRender } from "./pages/home/Home";
import { render as dialogElementRender } from "./pages/semantics/dialogElement";
import { render as detailsSummaryRender } from "./pages/semantics/detailsSummary";
import { render as formValidationRender } from "./pages/forms/formValidation";
import { render as popoverRender } from "./pages/forms/popover";
import { render as flexboxGridRender } from "./pages/layout/flexboxGrid";
import { render as containerQueriesRender } from "./pages/layout/containerQueries";
import { render as hasSelectorRender } from "./pages/selectors/hasSelector";
import { render as cascadeLayersRender } from "./pages/selectors/cascadeLayers";
import { render as customPropertiesColorRender } from "./pages/color-motion/customPropertiesColor";
import { render as viewTransitionsRender } from "./pages/color-motion/viewTransitions";
import { render as videoAudioApiRender } from "./pages/media/videoAudioApi";
import { render as trackCaptionsPipRender } from "./pages/media/trackCaptionsPip";

registerRoute("", homeRender);
registerRoute("semantics/dialog-element", dialogElementRender);
registerRoute("semantics/details-summary", detailsSummaryRender);
registerRoute("forms/form-validation", formValidationRender);
registerRoute("forms/popover", popoverRender);
registerRoute("layout/flexbox-grid", flexboxGridRender);
registerRoute("layout/container-queries", containerQueriesRender);
registerRoute("selectors/has-selector", hasSelectorRender);
registerRoute("selectors/cascade-layers", cascadeLayersRender);
registerRoute("color-motion/custom-properties-color", customPropertiesColorRender);
registerRoute("color-motion/view-transitions", viewTransitionsRender);
registerRoute("media/video-audio-api", videoAudioApiRender);
registerRoute("media/track-captions-pip", trackCaptionsPipRender);

const root = document.querySelector<HTMLDivElement>("#app")!;
const { contentEl, pageIndexEl } = mountLayout(root);

initRouter(contentEl, () => updatePageIndex(contentEl, pageIndexEl));
