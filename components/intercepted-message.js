var term = null;

var reg_url = 'https://forms.gle/Zj3NZf2FtjBKKksp8';
var command = '';

function prompt(term) {
    command = '';
    term.write('\r\n> ');
}

var commands = {
    help: {
        f: () => {
            term.writeln([
                'Looking for Grandma\'s house?',
                '',
                ...Object.keys(commands).map(e => `  ${e.padEnd(10)} ${commands[e].description}`)
            ].join('\n\r'));
            prompt(term);
        },
        description: '',
    },
    register: {
        f: () => {
            term.writeln(reg_url);
            window.open(reg_url, '_blank');
            term.prompt(term);
        },
        description: 'Register for the event'
    }
};

function setupxterm() {
    // Custom theme to match style of xterm.js logo
    var baseTheme = {
        foreground: '#F8F8F8',
        background: '#2D2E2C',
        selection: '#5DA5D533',
        black: '#1E1E1D',
        brightBlack: '#262625',
        red: '#CE5C5C',
        brightRed: '#FF7272',
        green: '#5BCC5B',
        brightGreen: '#72FF72',
        yellow: '#CCCC5B',
        brightYellow: '#FFFF72',
        blue: '#5D5DD3',
        brightBlue: '#7279FF',
        magenta: '#BC5ED1',
        brightMagenta: '#E572FF',
        cyan: '#5DA5D5',
        brightCyan: '#72F0FF',
        white: '#F8F8F8',
        brightWhite: '#FFFFFF'
    };
    // vscode-snazzy https://github.com/Tyriar/vscode-snazzy
    var otherTheme = {
        foreground: '#eff0eb',
        background: '#282a36',
        selection: '#97979b33',
        black: '#282a36',
        brightBlack: '#686868',
        red: '#ff5c57',
        brightRed: '#ff5c57',
        green: '#5af78e',
        brightGreen: '#5af78e',
        yellow: '#f3f99d',
        brightYellow: '#f3f99d',
        blue: '#57c7ff',
        brightBlue: '#57c7ff',
        magenta: '#ff6ac1',
        brightMagenta: '#ff6ac1',
        cyan: '#9aedfe',
        brightCyan: '#9aedfe',
        white: '#f1f1f0',
        brightWhite: '#eff0eb'
    };
    var isBaseTheme = true;

    term = new window.Terminal({
        fontFamily: 'droid_sans_mono_regular, "Syne Mono", "Cascadia Code", Menlo, monospace',
        theme: otherTheme,
        cursorBlink: true,
        allowProposedApi: true,
    });
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon.WebLinksAddon());
    term.open(document.getElementById('interceptedMessage'));
    fitAddon.fit();

    var isWebglEnabled = false;
    try {
        const webgl = new window.WebglAddon.WebglAddon();
        term.loadAddon(webgl);
        isWebglEnabled = true;
    } catch (e) {
        console.warn('WebGL addon threw an exception during load', e);
    }

    // Cancel wheel events from scrolling the page if the terminal has scrollback
    document.querySelector('.xterm').addEventListener('wheel', e => {
        if (term.buffer.active.baseY > 0) {
            e.preventDefault();
        }
    });
}

function runFakeTerminal() {
    if (term._initialized) {
        return;
    }

    term._initialized = true;

    term.prompt = () => {
        term.write('\r\n> ');
    };

    // TODO: Use a nicer default font
    // term.writeln([
    //     '    Xterm.js is the frontend component that powers many terminals including',
    //     '                           \x1b[3mVS Code\x1b[0m, \x1b[3mHyper\x1b[0m and \x1b[3mTheia\x1b[0m!',
    //     '',
    //     ' ┌ \x1b[1mFeatures\x1b[0m ──────────────────────────────────────────────────────────────────┐',
    //     ' │                                                                            │',
    //     ' │  \x1b[31;1mApps just work                         \x1b[32mPerformance\x1b[0m                        │',
    //     ' │   Xterm.js works with most terminal      Xterm.js is fast and includes an  │',
    //     ' │   apps like bash, vim and tmux           optional \x1b[3mWebGL renderer\x1b[0m           │',
    //     ' │                                                                            │',
    //     ' │  \x1b[33;1mAccessible                             \x1b[34mSelf-contained\x1b[0m                     │',
    //     ' │   A screen reader mode is available      Zero external dependencies        │',
    //     ' │                                                                            │',
    //     ' │  \x1b[35;1mUnicode support                        \x1b[36mAnd much more...\x1b[0m                   │',
    //     ' │   Supports CJK 語 and emoji \u2764\ufe0f            \x1b[3mLinks\x1b[0m, \x1b[3mthemes\x1b[0m, \x1b[3maddons\x1b[0m,            │',
    //     ' │                                          \x1b[3mtyped API\x1b[0m, \x1b[3mdecorations\x1b[0m            │',
    //     ' │                                                                            │',
    //     ' └────────────────────────────────────────────────────────────────────────────┘',
    //     ''
    // ].join('\n\r'));

    // term.writeln('Below is a simple emulated backend, try running `help`.');
    addDecoration(term);
    // prompt(term);

    term.onData(e => {
        switch (e) {
            case '\u0003': // Ctrl+C
                term.write('^C');
                prompt(term);
                break;
            case '\r': // Enter
                runCommand(term, command);
                command = '';
                break;
            case '\u007F': // Backspace (DEL)
                // Do not delete the prompt
                if (term._core.buffer.x > 2) {
                    term.write('\b \b');
                    if (command.length > 0) {
                        command = command.substr(0, command.length - 1);
                    }
                }
                break;
            default: // Print all other characters for demo
                if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                    command += e;
                    term.write(e);
                }
        }
    });

    // Create a very simple link provider which hardcodes links for certain lines
    // term.registerLinkProvider({
    //     provideLinks(bufferLineNumber, callback) {
    //         switch (bufferLineNumber) {
    //             case 2:
    //                 callback([
    //                     {
    //                         text: 'VS Code',
    //                         range: { start: { x: 28, y: 2 }, end: { x: 34, y: 2 } },
    //                         activate() {
    //                             window.open('https://github.com/microsoft/vscode', '_blank');
    //                         }
    //                     },
    //                     {
    //                         text: 'Hyper',
    //                         range: { start: { x: 37, y: 2 }, end: { x: 41, y: 2 } },
    //                         activate() {
    //                             window.open('https://github.com/vercel/hyper', '_blank');
    //                         }
    //                     },
    //                     {
    //                         text: 'Theia',
    //                         range: { start: { x: 47, y: 2 }, end: { x: 51, y: 2 } },
    //                         activate() {
    //                             window.open('https://github.com/eclipse-theia/theia', '_blank');
    //                         }
    //                     }
    //                 ]);
    //                 return;
    //             case 8:
    //                 callback([
    //                     {
    //                         text: 'WebGL renderer',
    //                         range: { start: { x: 54, y: 8 }, end: { x: 67, y: 8 } },
    //                         activate() {
    //                             window.open('https://npmjs.com/package/xterm-addon-webgl', '_blank');
    //                         }
    //                     }
    //                 ]);
    //                 return;
    //             case 14:
    //                 callback([
    //                     {
    //                         text: 'Links',
    //                         range: { start: { x: 45, y: 14 }, end: { x: 49, y: 14 } },
    //                         activate() {
    //                             window.alert('You can handle links any way you want');
    //                         }
    //                     },
    //                     {
    //                         text: 'themes',
    //                         range: { start: { x: 52, y: 14 }, end: { x: 57, y: 14 } },
    //                         activate() {
    //                             isBaseTheme = !isBaseTheme;
    //                             term.setOption('theme', isBaseTheme ? baseTheme : otherTheme);
    //                             document.querySelector('.demo .inner').classList.toggle('other-theme', !isBaseTheme);
    //                             term.write(`\r\nActivated ${isBaseTheme ? 'xterm.js' : 'snazzy'} theme`);
    //                             prompt(term);
    //                         }
    //                     },
    //                     {
    //                         text: 'addons',
    //                         range: { start: { x: 60, y: 14 }, end: { x: 65, y: 14 } },
    //                         activate() {
    //                             window.open('/docs/guides/using-addons/', '_blank');
    //                         }
    //                     }
    //                 ]);
    //                 return;
    //             case 15: callback([
    //                 {
    //                     text: 'typed API',
    //                     range: { start: { x: 45, y: 15 }, end: { x: 53, y: 15 } },
    //                     activate() {
    //                         window.open('https://github.com/xtermjs/xterm.js/blob/master/typings/xterm.d.ts', '_blank');
    //                     }
    //                 },
    //                 {
    //                     text: 'decorations',
    //                     range: { start: { x: 56, y: 15 }, end: { x: 66, y: 15 } },
    //                     activate() {
    //                         window.open('https://github.com/xtermjs/xterm.js/blob/master/typings/xterm.d.ts#L947', '_blank');
    //                     }
    //                 },
    //             ]);
    //                 return;
    //         }
    //         callback(undefined);
    //     }
    // });
}


function runCommand(term, text) {
    const command = text.trim().split(' ')[0];
    if (command.length > 0) {
        term.writeln('');
        if (command in commands) {
            commands[command].f();
            return;
        }
        term.writeln(`${command}: command not found`);
    }
    prompt(term);
}


function addDecoration(term) {
    // const marker = term.addMarker(15);
    // const decoration = term.registerDecoration({ marker, x: 44 });
    // decoration.onRender(element => {
    //     element.classList.add('link-hint-decoration');
    //     element.innerText = 'Try clicking italic text';
    //     // must be inlined to override inlined width/height coming from xterm
    //     element.style.height = '';
    //     element.style.width = '';
    // });
}

function dumpMessage(message) {
    var im = $("#interceptedMessage");
    im.html($('<pre></pre>').html(message));
    im[0].scrollTop = im[0].scrollHeight;
}


layout.registerComponent( 'interceptedMessage', function(container, componentState){
    container.getElement().html('<div class="log" id="interceptedMessage"></div>');
    container.on('open', function() {
        //term.setOption('cursorBlink', true);
        setupxterm();
        // runFakeTerminal();
        dumpDelayed();
    });
});

const msg = `
\u001b[31m
/// MSG INTERCEPT -- Flags [.], cksum 0xfe28 (incorrect -> 0xb93a), seq 1421, ack 26, win 6379
\r\n
Over the river and through the woods to Grandma's house we go! Grandma has that famous, sweet, sweet pumpkin pie 🥧 coming out of the oven and you must get there soon!
\r\n
Join us on our text-based adventure to Grandma's house to get some of that delicious pie 🥧 -  coming this January 26th. This adventure is trickier than you remembered from previous years. The woods are impossible to navigate, and Grandma's security system has all the fixings. 
\r\n
Expect reverse engineering, pwnable, and web challenges along the way - but move quickly before the pie 🥧 is all gone.
\r\n
Alongside our text-based adventure, REDLattice will be hosting a game of Jeopardy – including all the important topics such as: famous malware, technical expertise, vulnerability types, assembly challenges and more!
\r\n
Make sure to register to attend!\u001b[0m\r\n
January 26th, 4-7PM\r\n
` + reg_url + '\r\n';


var msgIndex = 0;
var msgTimeout;
function dumpDelayed() {
    if (msgIndex >= msg.length)
    {
        // dumpMessage(msg + contact);
        clearTimeout(msgTimeout);
        runFakeTerminal();
        prompt(term);
    }
    else {
        msgTimeout = setTimeout(dumpDelayed, 10);
        term.write(msg.slice(msgIndex, msgIndex + 3))
        // dumpMessage(msg.slice(0, msgIndex));
        msgIndex += 3;
    }
}
