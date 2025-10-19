const inputs = document.querySelectorAll(".input"),
    selects = document.querySelectorAll(".select");
function focusFanc() {
    this.parentNode.parentNode.classList.add("focus");
}
function blurFanc() {
    var e = this.parentNode.parentNode;
    "" === this.value && e.classList.remove("focus");
}
inputs.forEach((e) => {
    var t = e.parentNode.parentNode;
    "" !== e.value && t.classList.add("focus"), e.addEventListener("focus", focusFanc), e.addEventListener("blur", blurFanc);
}),
    selects.forEach((e) => {
        var t = e.parentNode.parentNode;
        "" !== e.value && t.classList.add("focus"),
            e.addEventListener("focus", focusFanc),
            e.addEventListener("change", function () {
                var e = this.parentNode.parentNode;
                "" !== this.value && e.classList.add("focus");
            }),
            e.addEventListener("blur", blurFanc);
    });
const select = document.getElementById("country_code"),
    infoBox = document.getElementById("country_code_value");
function updateInfoBox() {
    var e = select.options[select.selectedIndex];
    e && e.value && (infoBox.textContent = e.getAttribute("data-info"));
}
if (select) {
    select.addEventListener("change", updateInfoBox);
    const i = new MutationObserver(() => {
        updateInfoBox();
    });
    i.observe(select, { attributes: !0, attributeFilter: ["value"] });
}
function handleShowPassword(e) {
    var t = e.target.closest("div").querySelector("input");
    t && ("password" == t.type ? (t.type = "text") : (t.type = "password"), e.target.classList.toggle("bi-eye-slash-fill"), e.target.classList.toggle("bi-eye-fill"));
}
let timer = null;
function getStatesByCountry(t) {
    try {
        timer && clearTimeout(timer),
            (timer = setTimeout(() => {
                var e = new FormData();
                e.set("country", t.target.value),
                    fetch("/get-country-states", { method: "POST", body: e })
                        .then((e) => (e.ok, e.json()))
                        .then((e) => {
                            document.getElementById("stateSelect").innerHTML = '<option value="Select State">Select State</option>';
                            for (const o of e.states) {
                                var t = document.createElement("option");
                                (t.value = o), (t.textContent = o), document.getElementById("stateSelect").appendChild(t);
                            }
                            var n = document.getElementById("country_code");
                            (n.value = e.country_code), n.dispatchEvent(new Event("change"));
                        });
            }, 1e3));
    } catch (e) {
        return null;
    }
}
