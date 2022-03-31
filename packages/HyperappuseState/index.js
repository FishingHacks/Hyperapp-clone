window.addEventListener("hyerapprender", ()=> {
    useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.i=-1;
});

let useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja = {
    states: [],
    i:-1,
}

function useState(defaultValue) {
    useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.i++;
    let index = useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.i;
    if(useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.states[index]==null) useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.states[index]=defaultValue;

    function setState(newValue) {
        useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.states[index]=newValue;
        globalThis?.vdom?.render();
    }

    return [useStateObject_32459839408920384kfasdkfhjsdjhfajskhdksja.states[index], setState];
}