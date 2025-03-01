import type { GatsbySSR } from "gatsby";

export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({ getHeadComponents, replaceHeadComponents, pathname }) => {
  let headComponents = getHeadComponents();
  headComponents = headComponents.filter((component: any) => !(
    component.type === "link" &&
    component.props.as === "font" &&
    component.props.rel === "preload" &&
    component.props.href.includes("fonts.gstatic.com/s/materialsymbols")
  ));
  replaceHeadComponents(headComponents);
}