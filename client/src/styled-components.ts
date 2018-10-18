import * as styledComponents from 'styled-components';

export interface ITheme {}
export const theme: ITheme = {};

const range = (width: number) => (
    rule: TemplateStringsArray,
    ...args: TemplateStringsArray[]
) => css`
    @media (min-width: ${`${width}px`}) {
        ${css(rule, ...args)};
    }
`;

export const media = {
    sm: range(576),
    md: range(768),
    lg: range(992),
    xl: range(1200),
};

const {
    default: styled,
    css,
    keyframes,
    ThemeProvider,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ITheme>;

export default styled;
export { css, keyframes, ThemeProvider };
