import { html } from "./html.js";

export const Container = (props, children) => html`
  <div class="${props.class || ""} pt-2 pb-2">
    <div class="container grid-md">
      ${children}
    </div>
  </div>
`;
