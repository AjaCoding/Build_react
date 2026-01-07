/* Last modified: 1/6/2025 
    basically creating my own DOM API to use to make websites
*/

let hookStates = []; // represents all vars needed across states
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
function render(element, container) {
    function update() {
      hookIndex = 0;
      const container = document.getElementById("root");
      container.innerHTML = "";
      MyReact.render(App, container);
    }

    if (typeof element.type === "function") {
        // adding support for children
        const propsWithChildren = {
          ...element.props,
          children: element.children
        };

        const child = element.type(propsWithChildren);
        return render(child, container);
    }

  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  
      console.log("Rendering:", element.type);

  // Apply props
  const isProperty = key => key !== "children";

  // setProps()
  Object.keys(element.props).filter(isProperty)
    .forEach(name => {
      const value = element.props[name];

      //console.log(name)
      if (name == "nodeValue") {
          dom.nodeValue = element.props[name];
      } 
      else if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, value);
      }
      else if (name === "style" && typeof value === "object") {
        Object.assign(dom.style, value);
      }
      else {
          // Optional check here, adding a check for if the prop is boolean to keep it non-text
          dom.setAttribute(name, element.props[name]);
      }
      });

  // Render children
  element.children.forEach(child => {
    render(child, dom);
  });

  container.appendChild(dom);
}

function useState(initialValue) {
  const currentIndex = hookIndex;

  hookStates[currentIndex] =
    hookStates[currentIndex] !== undefined
      ? hookStates[currentIndex]
      : initialValue;

  function setState(newValue) {
    hookStates[currentIndex] = newValue;
    update(); // trigger re-render
  }

  hookIndex++;
  return [hookStates[currentIndex], setState];
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
  MyReact.createElement(Goodbye, {name: "This"}),
  MyReact.createElement(CreateCounterElement, null)
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
