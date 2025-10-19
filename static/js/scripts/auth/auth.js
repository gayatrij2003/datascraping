const inputs = document.querySelectorAll(".input");
const selects = document.querySelectorAll(".select"); // Select elements

// Function to add focus effect on inputs
function focusFanc() {
    let parent = this.parentNode.parentNode;
    parent.classList.add("focus");
}

// Function to remove focus effect if empty
function blurFanc() {
    let parent = this.parentNode.parentNode;
    if (this.value === "") {
        parent.classList.remove("focus");
    }
}

// Apply focus/blur for inputs
inputs.forEach((input) => {
    let parent = input.parentNode.parentNode;
    if (input.value !== "") {
        parent.classList.add("focus");
    }
    input.addEventListener("focus", focusFanc);
    input.addEventListener("blur", blurFanc);
});

// Apply focus/blur for selects
selects.forEach((select) => {
    let parent = select.parentNode.parentNode;
    if (select.value !== "") {
        parent.classList.add("focus");
    }

    select.addEventListener("focus", focusFanc);
    select.addEventListener("change", function () {
        // Ensure focus effect stays when an option is selected
        let parent = this.parentNode.parentNode;
        if (this.value !== "") {
            parent.classList.add("focus");
        }
    });

    select.addEventListener("blur", blurFanc);
});

const select = document.getElementById("country_code");
const infoBox = document.getElementById("country_code_value");

// Function to update the info box based on the selected value
function updateInfoBox() {
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.value) {
        infoBox.textContent = selectedOption.getAttribute("data-info");
    }
}

// When an option is selected manually
if (select) {
    select.addEventListener("change", updateInfoBox);
    // Observe changes to the <select> value (for external function updates)
    const observerSelect = new MutationObserver(() => {
        updateInfoBox(); // Update the info box whenever the <select> value changes
    });

    observerSelect.observe(select, { attributes: true, attributeFilter: ["value"] });
}

function handleShowPassword(event) {
    const parentDiv = event.target.closest("div");
    const input = parentDiv.querySelector("input");

    if (input) {
        if (input.type == "password") {
            input.type = "text";
        } else {
            input.type = "password";
        }
        event.target.classList.toggle("bi-eye-slash-fill");
        event.target.classList.toggle("bi-eye-fill");
    }
}

let timer = null;
function getStatesByCountry(event) {
    try {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            const formdata = new FormData();
            formdata.set("country", event.target.value);
            fetch("/get-country-states", { method: "POST", body: formdata })
                .then((response) => {
                    if (!response.ok) {
                    }
                    return response.json();
                })
                .then((data) => {
                    const stateSelect = document.getElementById("stateSelect");
                    stateSelect.innerHTML = '<option value="Select State">Select State</option>';
                    for (const state of data.states) {
                        const option = document.createElement("option");
                        option.value = state;
                        option.textContent = state;
                        document.getElementById("stateSelect").appendChild(option);
                    }
                    const countryCode = document.getElementById("country_code");
                    countryCode.value = data.country_code;
                    countryCode.dispatchEvent(new Event("change")); // Manually trigger the change event
                });
        }, 1000);
    } catch (error) {
        return null;
    }
}
