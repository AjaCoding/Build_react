function formToElement(formData) {
    const tag = formData.get("tag");
    const content = formData.get("content");

    const props = {};

    if (formData.get("id")) {
        props.id = formData.get("id");
    }

    if (formData.get("class")) {
        props.class = formData.get("class");
    }

    // or
    // for (let [key, value] of formData.entries()) {
    //    if (key !== "tag" && key !== "content" && value !== "") {
    //        props[key] = value;
    //    }
    //}

    

    return [tag, props, content];
}

function addItemInputRow() {

}

document.addEventListener("DOMContentLoaded", () => {
    const myForm = document.getElementById("mainForm");
    let docElements = [];
    const formData = new FormData(myForm);

    const tag = formData.get("tag");
    const content = formData.get("content");
    const id = formData.get("id");
    const className = formData.get("class");

    myForm.addEventListener("submit", function(event) {
        event.preventDefault();

        console.log("HERE  IS ROOT",root);

        //const username = document.getElementById("p");
        //const content = document.getElementById("p").value            
        // ["p", null, content];


        console.log("Form submitted!");
        for (let i in docElements){
            console.log(docElements[i]);
        }
        alert("You entered: " + content);
        

        const formData = new FormData(myForm);

        const newElement = formToElement(formData);

        docElements.push(newElement);

        console.log("All elements:", docElements);

            
        
        
        const root = document.getElementById("rootContainer");
        const Builder = build(docElements);
        MyReact.render(Builder, root);

    });

    // export const docElements;
});





