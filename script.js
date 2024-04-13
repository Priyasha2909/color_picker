const pickerBtn = document.querySelector("#picker-btn");
const exportBtn = document.querySelector("#export-btn");
const clearBtn = document.querySelector("#clear-btn");
const colorList = document.querySelector(".all-colors");


//for having list of colors
let pickedColors = JSON.parse(localStorage.getItem("color-list")) || [];   //agar default storage me koi color hua to otherwise empty array de rhe hai

let currentPopUp = null;


//to copy the color to clipboard
const copyToClipboard = async(text,element) => {
    try{
        await navigator.clipboard.writeText(text);
        element.innerText = "Copied!";
        setTimeout(() =>{
            element.innerText = text;         //after 1second reset the value of element to be == text value
        },1000);
    }
    catch(err){
        alert("Failed to copy text! 1")
    }
}


//To export the picked colors in a file format
const exportColor = () =>{
    const colorText = pickedColors.join("\n");         //pickedColors take an array & convert it to string and join back with new line
    const blob = new Blob([colorText],{type:"text/plain"});  //Blob is a raw container which takes first arg as data(here an array) and second type of data
    const url = URL.createObjectURL(blob);  //a unique url represents the blob object 
    const a = document.createElement("a"); //generating a anchor tag <a></a>
    a.href = url;
    a.download = 'Colors.txt';  //rename the downloaded file
    document.body.appendChild(a);  //to make the link clickable
    a.click();                        // triggers the click event which initiates the downloading of file automatically
    document.body.removeChild(a); //for cleanup purpose we remove the link
    URL.revokeObjectURL(url);      //for cleanup only : to clear the space which the url takes
} 


//Creating color popup
const createColorPopup = (color) => {
    const popup = document.createElement("div");
    popup.classList.add("color-popup");
    popup.innerHTML = `
        <div class="color-popup-content">
            <span class="close-popup">x</span>
            <div class="color-info">
                <div class="color-preview" style="background: ${color};"></div>
                    <div class="color-details">
                        <div class="color-value">
                            <span class="label">Hex:</span>
                            <span class="value hex" data-color="${color}">${color}</span>
                        </div>
                        <div class="color-value">
                            <span class="label">RGB:</span>
                            <span class="value rgb" data-color="${color}">${hexToRgb(color)}</span>
                        </div>
                </div>
            </div>
        </div>
    `;

    // Close button inside the popup
    const closePopup = popup.querySelector(".close-popup");
    closePopup.addEventListener('click', () => {
        document.body.removeChild(popup);
        currentPopUp = null;
    });


    //adding a event listener to copy the values(selected in popup) to our clipboard 
//popup is a div we created above - remember
    // Event listeners to copy color values to clipboard
    const colorValues = popup.querySelectorAll(".value");
    colorValues.forEach((value) => {
        value.addEventListener('click', (e) => {
            const text = e.currentTarget.innerText;
            copyToClipboard(text, e.currentTarget);
        });
    });

    return popup;
};


//To print the colors
const showColors = () => {
    colorList.innerHTML = pickedColors.map((color) =>   //map all colors to be in listitem
        `
            <li class="color">
                <span class="rect" style="background: ${color}; border: 1px solid ${color === "#ffffff" ? "#ccc" : color}"></span>
                <span class="value hex" data-color="${color}">${color}</span>
            </li>
        `
    ).join("");

    const colorElements = document.querySelectorAll(".color");
    colorElements.forEach((li) => {
        const colorHex = li.querySelector(".value.hex");
        colorHex.addEventListener('click', (e) => {
            const color = e.currentTarget.dataset.color;
            if (currentPopUp) {
                document.body.removeChild(currentPopUp);   //currenpopup hai to we will remove the popup to select new color
            }
            const popup = createColorPopup(color);
            document.body.appendChild(popup);
            currentPopUp = popup;
        });
    });

    const pickedColorsContainer = document.querySelector(".color-list");
    pickedColorsContainer.classList.toggle("hide", pickedColors.length === 0);
};


//to convert hex to rgb valueof color
const hexToRgb = (hex) =>{
    const bigInt = parseInt(hex.slice(1),16);  //slice to remove # and start from 1 to no. and convert that no. to base 16(hexadecimal format)
    const r = (bigInt >> 16 ) & 255;       //using right shift and after using & operator we will get 8 least signif. bits
    const g = (bigInt >> 8) & 255;
    const b = bigInt & 255;          //using all these to get rgb values
    return `rgb(${r}, ${g}, ${b})`;
}



//to activate color picker
const activateEyeDropper = async () => {
    document.body.style.display = "none";
    try {
        const { sRGBHex } = await new EyeDropper().open();

        if (!pickedColors.includes(sRGBHex)) {        //if we don't have the color selected we will pick the new color so new 
            pickedColors.push(sRGBHex);               // new colors are added only and no color is repeated
            localStorage.setItem("colors-list", JSON.stringify(pickedColors));   //to store the picked colors in local storage
        }

        showColors();
    } catch (error) {
        alert(error);
    } finally {
        document.body.style.display = "block";
    }
};



//clear all functionalities
const clearAll = () => {
    pickedColors = [];
    localStorage.removeItem("colors-list");
    showColors();
}


//Attaching functionalities to buttons
pickerBtn.addEventListener('click',activateEyeDropper);
clearBtn.addEventListener('click',clearAll);
exportBtn.addEventListener('click',exportColor);


//Display the picked color on document load
showColors();