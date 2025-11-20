import { style } from '@vanilla-extract/css';

export const layout = style({
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'var(--sidebar-expanded-width) 1fr',
    gridTemplateRows: 'var(--header-height) 1fr',
    gridTemplateAreas: '"header header" "sidebar main"',
    height: '100%',
});

export const background = style({
    gridArea: 'header / sidebar / main / main',
});

export const header = style({
    gridArea: 'header',
});

export const sidebar = style({
    gridArea: 'sidebar',
});

export const main = style({
    gridArea: 'main',
});
