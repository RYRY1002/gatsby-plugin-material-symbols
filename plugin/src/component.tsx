import * as React from "react";
import type { ElementType, CSSProperties, ReactElement, Ref } from "react";
import { forwardRef } from "react";

import type { MaterialSymbolGrade, MaterialSymbolSize, MaterialSymbolWeight, PolymorphicComponentProps, MaterialSymbolCodepoints } from './types';
export type { MaterialSymbolWeight, MaterialSymbolGrade, MaterialSymbolSize, MaterialSymbolCodepoints } from './types';

import type { Classes } from './types';

/**
 * Combines an array of classes into a single space delimited-string.
 *
 * @param classes List of input classes. Values are filtered out if they evaluate to `false`. See {@link Boolean}.
 */
function combineClasses(...classes: Classes): string {
	return (classes.filter(Boolean) as string[]).map((c) => c.trim()).join(' ');
}

export type MaterialSymbolProps = {
	/** Required. The name of the icon to render. */
	icon: MaterialSymbolCodepoints;

	/** Default `false`.
	 *
	 * Fill gives you the ability to modify the default icon style. A single icon can render both unfilled and filled states. */
	fill?: boolean;

	/** Weight defines the symbol’s stroke weight, with a range of weights between thin (100) and heavy (900). Weight can also affect the overall size of the symbol. */
	weight?: MaterialSymbolWeight;

	/** Weight and grade affect a symbol’s thickness. Adjustments to grade are more granular than adjustments to weight and have a small impact on the size of the symbol. */
	grade?: MaterialSymbolGrade;

	/** Default `'inherit'`.
	 *
	 * Size defines the icon width and height in pixels. For the image to look the same at different sizes, the stroke weight (thickness) changes as the icon size scales. */
	size?: number;

	/** Default `'outlined'`
	 * 
	 * Determines which variant of Material Symbols to use.
	 * @property `outlined`: The default style.
	 * @property `rounded`: Same as outlined except all sharp edges are rounded.
	 * @property `sharp`: Same as outlined except all rounded edges are sharpned.
	 */
	symbolStyle?: "outlined" | "rounded" | "sharp";

	className?: string;
	style?: CSSProperties;

	/** Default `false`
	 * 
	 * By default, variable font axes are set inline per element. This can be disabled if you have a stylesheet that sets these values.
	 * 
	 * @tip All Material Symbols have 2 classes you can use to style them: `material-symbol` and `material-symbols-{symbolStyle}`, plus any additional classes you pass.
	 */
	removeInlineStyles?: boolean;
};

export type PolymorphicMaterialSymbolProps<C extends ElementType> = PolymorphicComponentProps<
	C,
	MaterialSymbolProps
>;

export const MaterialSymbol = forwardRef<HTMLElement, PolymorphicMaterialSymbolProps<ElementType>>(
	(
		{
			icon,
			fill = false,
			weight,
			grade,
			size,
			symbolStyle = "outlined",
			className,
			style: styleProp,
			removeInlineStyles = false,
			as,
			onClick,
			...props
		},
		ref
	): ReactElement => {
		const Component = onClick !== undefined ? "button" : (as as ElementType) ?? "span";
		const style = { ...styleProp } as CSSProperties;

		if (!removeInlineStyles) {
			if (fill) {
				style.fontVariationSettings = [style.fontVariationSettings, '"FILL" 1']
					.filter(Boolean)
					.join(', ');
			}
			if (weight) {
				style.fontVariationSettings = [style.fontVariationSettings, `"wght" ${weight}`]
					.filter(Boolean)
					.join(', ');
			}
			if (grade) {
				style.fontVariationSettings = [style.fontVariationSettings, `"GRAD" ${grade}`]
					.filter(Boolean)
					.join(', ');
			}
			if (size) {
				style.fontVariationSettings = [style.fontVariationSettings, `"opsz" ${size}`]
					.filter(Boolean)
					.join(', ');
				style.fontSize = size;
			}
		}
		let symbolStyleClass: string = `material-symbol material-symbols-${symbolStyle}`;

		return (
			<Component
				{...props}
				ref={ref}
				style={style}
				onClick={onClick}
				className={combineClasses(symbolStyleClass, className)}
			>
				{icon}
			</Component>
		);
	}
) as <C extends ElementType>(props: PolymorphicMaterialSymbolProps<C>) => ReactElement;

export default MaterialSymbol;