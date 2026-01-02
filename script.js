/* Last modified: 12/24/2025 
    basically creating my own DOM API to use to make websites
*/

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
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // Apply props
  const isProperty = key => key !== "children";

  // setProps()
  Object.keys(element.props).filter(isProperty)
    .forEach(name => {
      console.log(name)
      if (name == "nodeValue") {
          dom.nodeValue = element.props[name];
      } else {
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



// Our new React tool name, isntead of React, use MyReact // can change later!
const MyReact = {
    createElement,
    render
};

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

const container = document.getElementById("root")

//MyReact.render(newElement, container)

// Make container element App and add children(p, a, h1...)
const App = MyReact.createElement(
  "div",
  { id: "app" },
  MyReact.createElement("h1", {style: {color: "red"}}, "Hello from MyReact"),
  MyReact.createElement("p", null, "This is Phase 1"),
  MyReact.createElement("br", null, ""),
  MyReact.createElement("a", {href: "https://www.google.com"}, "link here"),
  MyReact.createElement("div", {id: "innerContent"}, 
    MyReact.createElement("p", null, "This content is nested")
  )
);

MyReact.render(App, container);

