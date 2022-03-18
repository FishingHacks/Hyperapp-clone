let application = null;

function load() {
  application = app({
    node: document.body,
    init: { count: 0 },
    /**
     *
     * @param {{count: number}} param0
     * @returns {Array<VNode>}
     */
    elements: (state) => {
      console.log(state);
      return [
        h("p", [], {}, `You clicked ${state.count} times!`),
        h(
          "button",
          [],
          {
            events: {
              click: () => state.count++,
            },
          },
          "count +1"
        ),
      ];
    },
    subscriptions: [],
  });
}
