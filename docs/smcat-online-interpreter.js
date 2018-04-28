const smcat = require('../src');
let gCurrentRenderer  = "svg";
let gCurrentEngine    = "dot";
let gCurrentDirection = "top-down";

function render(pType, pEngine, pDirection){
    pType = Boolean(pType) ? pType : gCurrentRenderer;
    gCurrentRenderer = pType;
    pEngine = Boolean(pEngine) ? pEngine : gCurrentEngine;
    gCurrentEngine = pEngine;
    pDirection = Boolean(pDirection) ? pDirection : gCurrentDirection;
    gCurrentDirection = pDirection;

    window.output.innerHTML = 'Loading ...';
    try {
        const lResult = smcat.render(
            window.inputscript.value,
            {
                inputType: "smcat",
                outputType: pType,
                engine: pEngine,
                direction: pDirection
            }
        );
        switch (pType){
            case "json": {
                window.output.innerHTML = "<pre>" + JSON.stringify(lResult, null, "    ") + "</pre>";
                break;
            }
            case "scjson": {
                window.output.innerHTML = "<pre>" + JSON.stringify(lResult, null, "    ") + "</pre>";
                break;
            }
            case "dot":
            case "scxml": {
                window.output.innerHTML = "<pre>" + lResult.replace(/</g, "&lt;") + "</pre>";
                break;
            }
            case "svg": {
                window.output.innerHTML = lResult;
                break;
            }
            default: {
                window.output.innerHTML = "<pre>" + lResult + "</pre>";
            }
        }
    } catch (pError) {
        window.output.innerHTML = pError;
    }
}

function setTextAreaToWindowHeight(){
    window.inputscript.style.height = '${height}px'.replace('${height}', window.innerHeight - 120);
}

window.json.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.json`,
                event_label: 're:json'
            },
            render, "json"
        )
    },
    false
);
window.dot.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.dot`,
                event_label: 're:dot'
            },
            render, "dot"
        )
    },
    false
);
window.smcat.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.smcat`,
                event_label: 're:smcat'
            },
            render, "smcat"
        )
    },
    false
);
window.scjson.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.scjson`,
                event_label: 're:sjson'
            },
            render, "sjson"
        )
    },
    false
);
window.scxml.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.scxml`,
                event_label: 're:scxml'
            },
            render, "scxml"
        )
    },
    false
);
window.html.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.html`,
                event_label: 're:html'
            },
            render, "html"
        )
    },
    false
);
window.svg.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.svg`,
                event_label: 're:svg'
            },
            render, "svg", "dot"
        )
    },
    false
);

window.inputscript.addEventListener(
    "input",
    function(){
        if (window.autorender.checked){
            render();
        }
    },
    false
);

window["top-down"].addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.${gCurrentRenderer}`,
                event_label: 're:top-down'
            },
            render, null, null, "top-down"
        )
    },
    false
);

window["left-right"].addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.${gCurrentRenderer}`,
                event_label: 're:left-right'
            },
            render, null, null, "left-right"
        )
    },
    false
);

window.autorender.addEventListener(
    "click",
    function(){
        if (window.autorender.checked){
            window.render.style = "display : none";
            render();
        } else {
            window.render.style = "";
        }
    }
);

window.render.addEventListener(
    "click",
    function(){
        timeTag(
            {
                event_category: `render.${gCurrentRenderer}`,
                event_label: 'button clicked'
            },
            render
        )
    }
);

if (window.engine) {
    window.engine.addEventListener(
        "change",
        function(pEvent){
            timeTag(
                {
                    event_category: `render.${gCurrentRenderer}`,
                    event_label: `re:with engine ${pEvent.target.value}`
                },
                render, null, pEvent.target.value, null
            )
        }
    );
}

if (window.samples) {
    window.samples.addEventListener(
        "change",
        function(pEvent){
            if (pEvent.target.value) {
                fetch(pEvent.target.value)
                .then(function(pResponse) {
                    if (pResponse.status === 200) {
                        return pResponse.text();
                    } else {
                        logError(pResponse);
                    }
                     
                })
                .then(function(pSourceText) {
                    if(pSourceText){
                        document.getElementById('inputscript').value = pSourceText;
                        if (window.autorender.checked){
                            timeTag(
                                {
                                    event_category: `render.${gCurrentRenderer}`,
                                    event_label: `${pEvent.target.value}`
                                },
                                render
                            );
                        }
                    }
                }).catch(logError);
            }
        }
    )
}

function timeTag(pTagConfig, pFunction) {
    const lTimingStart = performance.now();
    pFunction(...Array.from(arguments).slice(2));
    const lTiming = Object.assign(
        {},
        pTagConfig,
        {
            timing: Math.round(performance.now() - lTimingStart)
        }
    );
    LOG && console.log(lTiming);
    gtag('event', 'timed', lTiming);
}

function logError(pError) {
    LOG && console.error(pError);
    gtag('event', 'exception', {
        'description': pError,
        'fatal': false
    });
}

window.addEventListener("resize", setTextAreaToWindowHeight);

setTextAreaToWindowHeight();
window.version.innerHTML = "state machine cat ${version}".replace("${version}", smcat.version);
timeTag(
    {
        event_category: `render.${gCurrentRenderer}`,
        event_label: 'initial sample'
    },
    render, gCurrentRenderer, gCurrentEngine, gCurrentDirection
);
