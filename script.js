/* Last modified: 1/13/2025 
    basically creating my own DOM API to use to make websites
*/

//let hookStates = []; // represents all vars needed across states, replaced by fiber.hooks
let hookIndex = 0;

/* Function to make an html element with
    type = element type aka div, p, h1,...
    props = specific attributes of that element: style, variable, etc...
    children = DOM tree structure
*/
function createElement(type, props, ...children) {
    return {
        type, 
        props: props || {}, 
        children: children.map(child =>   
            typeof child === "object" ? child : createTextElement(child) // check text or object
        )
    };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text },
        children: []
    };
}

// render objects. element is the virtual dom object being rendered, in its container
function createDom(fiber) {  // render --> createDom
    function update() {
      hookIndex = 0;
      const container = document.getElementById("root");
      container.innerHTML = "";
      MyReact.render(App, container);
    }
    // element --> fiber ??????
    if (typeof fiber.type === "function") {
        // adding support for children
        const propsWithChildren = {
          ...fiber.props,
          children: fiber.children
        };

        const child = fiber.type(propsWithChildren);
        return render(child, container);
    }

  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  
      console.log("Rendering:", fiber.type);

  // Apply props
  const isProperty = key => key !== "children";

  // setProps()
  Object.keys(fiber.props).filter(isProperty)
    .forEach(name => {
      const value = fiber.props[name];

      //console.log(name)
      if (name == "nodeValue") {
          dom.nodeValue = fiber.props[name];
      } 
      else if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, value);
      }
      else if (name === "style" && typeof value === "object") {
        Object.assign(dom.style, value);
      }
      else {
          // Optional check here, to add a check for if the prop is boolean to keep it non-text
          dom.setAttribute(name, fiber.props[name]);
      }
      });

  // Render children
  return dom
}

// Main checks for element types bool = condition
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

// DOM Mutation Logic
function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        prevProps[key] !== nextProps[key]
    )
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}


/*
  Function used to fully apply all changes, to commit the whole fiber tree to the DOM
  we have added, and now need to update or delete nodes
*/
function commitRoot() {
  // TODO add nodes to dom
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  //debugs :  
  console.log(
    fiber.effectTag,
    fiber.type,
    fiber.dom
  )

  // handle effect tags for dom nodes
  if (fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null) {
    domParent.appendChild(fiber.dom)  
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(
      fiber.dom,
      fiber,alternate.props,
      fiber.props
    )
  } 
  
  else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element, container) {
  wipRoot = {
    dom: container, 
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null  // represents the last fiber tree we committed to the DOM
let wipRoot = null 
let deletions = null // keep track of nodes for removal

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop) // like setTimeout. Browser will run the callback when the main thread is idle
}

// This time also gives us a deadline parameter. We use it to check how much time we have until the browser needs to take control again. 

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  // TODO 1/13/26 @ 6:00
  // Add dom node, create new fibers, return next unit of work
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // fiber.dom property is used to keep track of DOM nodes
  //if (fiber.parent) {
  //  fiber.parent.dom.appendChild(fiber.dom)
  //}

  // For each child we create a new fiber
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
  
  // fetch the ext unit of work if it exists
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
/*
  The element is the thing we want to render to the DOM and the oldFiber is what we rendered last time
*/
function reconcileChildren(wipFiber, elements) {
  let index = 0
  // alternate is the old fiber for this element
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child 
  let prevSibling = null
  while(index < elements.length || oldFiber != null) {
    const element = elements[index]

    const newFiber = null
    /* TODO compare oldFiber to element
     We compare the old and new to see if there are any changes to apply to DOM
     Three possible scenarios: 
        - the element stays the same type but props change
        - the type is different and new DOM node is needed
        - types are different and old fiber means remove the old node
    */
    const sameType = oldFiber && element && element.type == oldFiber.type

    if(sameType) {
      // update the node// main change from oldFiber --> element
      newFiber = {
        type: oldFiber.type,
        props: element.props, 
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      } // main change->making new dom node
    }
    if (oldFiber && !sameType) {
      // delete this oldFiber's node 
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    } 
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // Then we add the child to the fiber tree setting it as a child or a sibling
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

}

function useState(initial) {
  const oldHook =
    currentFiber.alternate &&
    currentFiber.alternate.hooks &&
    currentFiber.alternate.hooks[hookIndex]

  // state machine: state-current value, queue-pending updates
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  // Apply queued actions from last render
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state =
      typeof action === "function"
        ? action(hook.state)
        : action
  })

  const setState = action => {
    hook.queue.push(action)

    // Schedule new render
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  currentFiber.hooks.push(hook)
  hookIndex++

  return [hook.state, setState]
}

/* 
  Functions
  Take in: one argument (props)
  returns: dom object
*/

function Hello(props) {
  return createElement("h1", null, "Hello, " + props.name);
}

function Goodbye({ name, children }) {
  return createElement("p", null, "Goodbye, ", name, " ", ...children);
}

function MyComponent() {
  return createElement(
    "div",
    null,
    createElement(Hello, { name: "you ;)" },
      createElement("span", null, "🌱")
    ),
    createElement(Footer, null)
  );
}

function Footer() {
  return createElement("p", null, "Footer content");
}

// Essential for keeping states, this updates the state so that events don't update DOM directly
function update() {
  const container = document.getElementById("root");
  container.innerHTML = "";
  MyReact.render(App, container);
}

// Our new React tool name, isntead of React, use MyReact // can change later!
const MyReact = {
    createElement,
    render
};

const container = document.getElementById("root")

//MyReact.render(newElement, container)

// Make container element App and add children(p, a, h1...)
// Here create an "extra" element to showcase use of function components with children
// Attempting to create a table
// And use/display a count variable <-- first
// Handled with states: let count = 0;
// vvv MyReact.createElement("button", { onclick: handleClick}, "Increment");

function CreateCounterElement() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1)
    console.log("rendering Counter");
    //update();  <-- not needed anymore, present in useState()
  }

  console.log("click handler ran");

  return MyReact.createElement(
    "div",
    null,
    MyReact.createElement("p", null, "Count is: ", count),
    MyReact.createElement(
      "button", 
      { onClick: increment },
      "Increment"
    )
  );
};

function Counter() {
  const [count, setCount] = MyReact.useState(0)

  return MyReact.createElement(
    "button",
    {
      onClick: () => setCount(c => c + 1)
    },
    "Count: ", count
  )
}


function Toggle() {
  const [on, setOn] = MyReact.useState(false)

  return MyReact.createElement(
    "button",
    { onClick: () => setOn(o => !o) },
    on ? "ON" : "OFF"
  )
}


const App = MyReact.createElement(
  "div",
  { id: "app" },
  MyReact.createElement("h1", {style: {color: "red"}}, "Hello from MyReact"),
  MyReact.createElement("p", null, "This is Phase 2"),
  MyReact.createElement("br", null, ""),
  MyReact.createElement("a", {href: "https://www.google.com"}, "link here"),
  MyReact.createElement("div", {id: "innerContent"}, 
    MyReact.createElement("p", null, "This content is nested"),
    MyReact.createElement(CreateCounterElement, null)
  ),
  MyReact.createElement(Hello, {name: "Aja"}),
  MyReact.createElement(Counter, null),
  MyReact.createElement(Toggle, null),
  MyReact.createElement(Goodbye, {name: "This"})
  //MyReact.createElement(CreateCounterElement, null)
);

const root = document.getElementById("root");

// FINAL STEP: render elements, ONE call
MyReact.render(App, root);

// now create dom nodes
    //const dom = document.createElement(element.type)
    // loop through children list to add each to rendering on dom
// assign element props to the node
    // acts as a setProps function

// createDomNode, differentiate between text and object element
/*function createDomNode(vdom) {
  const dom =
    vdom.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(vdom.type);

  return dom;
}
*/


// Following pomb.us tutorial sorta?

// assigning the object values
// const element = {
//     type: "h1",
//     props: {  // array of various prperties held by oject
//         tite: "foo",
//         children: "Hello", // usually an array
//                             // txt node created since that's all that is needed
//     },
// }




// kinda making JSX
// instead of calling it every element, use the new react tool
// allows us to just use HTML in the element content
/** @jsx MyReact.createElement */
// const newElement = ( 
//     <div id="foo"> 
//         <h1> Hi from my react! </h1>
//         <p> it work? </p>
//     </div>  
    
// )
//^^^ MyReact.createElement(//"div",
// </a> MyReact.createElement("a", null, "bar"),
//MyReact.createElement("b")

// const node = document.createElement(element.type)  // assigns the type
// node["title"] = element.props.title  // use the object to assign values

// const text = document.createTextNode("")
// text["nodeValue"] = element.props.children // like props: {nodeValue: "hello"}

// node.appendChild(text)                      // append the text node to the element object
// CSSContainerRule.appendChild(node)          // append the node to the container it is in
