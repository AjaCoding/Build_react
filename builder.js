
document.addEventListener("DOMContentLoaded", () => {
    const myForm = document.getElementById("mainForm");

    myForm.addEventListener("submit", function(event) {
        event.preventDefault();

        //const username = document.getElementById("p");
        const content = document.getElementById("p").value;

        let docElements = [
            ["p", null, content]
        ];

        console.log("Form submitted!");
        for (let i in docElements){
            console.log(docElements[i]);
        }
        alert("You entered: " + content);    
        
        build(docElements);
        MyReact.render(Builder, root);

    });

    // export const docElements;
});


