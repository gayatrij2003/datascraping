function modalSubmitForm(e, n, t) {
    e.preventDefault();
    var a,
        r,
        e = n.closest("form");
    if (e)
        try {
            e.checkValidity() ? ((a = document.getElementById(t)), (r = bootstrap.Modal.getInstance(a)), document.activeElement.blur(), r.hide(), e.submit()) : e.reportValidity();
        } catch (e) {}
    else console.error("No parent form found!");
}
function handleUpgradePlan(e) {
    var n = document.querySelector("#upgrade_to");
    const t = document.getElementById("pro-rata-price");
    t.innerHTML = "";
    var a = document.createElement("div");
    a.classList.add("spinner"),
        t.appendChild(a),
        n &&
            ((a = new FormData()).append("upgrade_to", n.value),
            fetch("/change-plan", { method: "POST", body: a })
                .then((e) => e.json())
                .then((e) => {
                    setTimeout(() => {
                        t.innerHTML = "$" + e.price;
                    }, 1e3);
                }));
}
function handleRenewPlan(e, n) {
    var t = document.querySelector("#billingcycle");
    const a = document.getElementById("pro-rata-price2");
    a.innerHTML = "";
    var r = document.createElement("div"),
        r = (r.classList.add("spinner"), a.appendChild(r), new FormData());
    r.append("billingcycle", t.value),
        r.append("planid", n),
        fetch("/renew-plan", { method: "POST", body: r })
            .then((e) => e.json())
            .then((e) => {
                setTimeout(() => {
                    a.innerHTML = "$" + e.price;
                }, 1e3);
            });
}
