var layout;

let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

if (isMobile) {
    layout = new GoldenLayout(configmobile);
} else {
    layout = new GoldenLayout(config);
}
