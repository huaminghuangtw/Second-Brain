// Source: https://forum.obsidian.md/t/easily-switch-between-source-mode-live-preview-preview/27151/15

function setViewMode(mode) {
    const view = app.workspace.activeLeaf.getViewState();
    switch(mode) {
        case 'source':
            view.state.mode = 'source';
            view.state.source = true;
            break;
        case 'live':
            view.state.mode = 'source';
            view.state.source = false;
            break;
        case 'reading':
            view.state.mode = 'preview';
            break;
    }
    app.workspace.activeLeaf.setViewState(view);
}

module.exports = setViewMode;
