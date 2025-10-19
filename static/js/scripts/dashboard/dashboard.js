function modalSubmitForm(event, button, modal_id) {
    event.preventDefault();

    const form = button.closest("form");
    if (!form) {
        console.error("No parent form found!");
        return;
    }
    

    try {
        if (form.checkValidity()) {
            const modal = document.getElementById(modal_id);
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            document.activeElement.blur(); // Remove focus first

            bootstrapModal.hide();
            form.submit();
        } else {
            form.reportValidity();
        }
    } catch (e) {}
}

function handleUpgradePlan(event) {
    const upgrade_to = document.querySelector("#upgrade_to");
    const proRata = document.getElementById("pro-rata-price");
    proRata.innerHTML = "";
    const indiv = document.createElement("div");
    indiv.classList.add("spinner");
    proRata.appendChild(indiv);
    if (upgrade_to) {
        const formdata = new FormData();
        formdata.append("upgrade_to", upgrade_to.value);

        fetch("/change-plan", { method: "POST", body: formdata })
            .then((response) => {
                return response.json();
            })
            .then((response) => {
                setTimeout(() => {
                    proRata.innerHTML = `$${response.price}`;
                }, 1000);
            });
    }
}

function handleRenewPlan(event, planid) {
    const billingcycle = document.querySelector("#billingcycle");

    const proRata = document.getElementById("pro-rata-price2");
    proRata.innerHTML = "";
    const indiv = document.createElement("div");
    indiv.classList.add("spinner");
    proRata.appendChild(indiv);

    const formdata = new FormData();
    formdata.append("billingcycle", billingcycle.value);
    formdata.append("planid", planid);

    fetch("/renew-plan", { method: "POST", body: formdata })
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            setTimeout(() => {
                proRata.innerHTML = `$${response.price}`;
            }, 1000);
        });
}
