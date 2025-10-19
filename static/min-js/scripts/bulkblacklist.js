function toggleRequired(e, t) {
    e.forEach((e) => document.getElementById(e).setAttribute("required", "true")), t.forEach((e) => document.getElementById(e).removeAttribute("required"));
}
function toggleButton(e) {
    var t = document.getElementById("custom"),
        r = document.getElementById("custom_btn"),
        n = document.getElementById("bulk"),
        o = document.getElementById("bulk_btn");
    (t.style.display = e ? "block" : "none"), (n.style.display = e ? "none" : "block"), toggleRequired(e ? ["ips"] : ["ips1", "ips2"], e ? ["ips1", "ips2"] : ["ips"]), e ? (r.setAttribute("disabled", "true"), o.removeAttribute("disabled")) : (r.removeAttribute("disabled"), o.setAttribute("disabled", "true"));
}
function changeType() {
    "custom" === this.type ? toggleButton(!0) : toggleButton();
}
function get_results(o) {
    const s = new EventSource("/bulk-blacklist-stream");
    (document.getElementById("about").style.display = "none"),
        (s.onmessage = function (e) {
            let { data: r, count: n } = JSON.parse(e.data);
            ["zen.spamhaus.org", "b.barracudacentral.org", "bl.spamcop.net"].forEach((t, e) => {
                e = document.getElementById(r.ip + "-" + e);
                e && ((e.style.textAlign = "center"), (e.innerHTML = " Ok "), (e.className = "tb-detected1"), r.result) && r.result.is_blacklisted && r.result.detected_on.some((e) => e.name === t) && ((e.innerHTML = " Listed "), (e.className = "tb-detected"));
            }),
                ["zen.spamhaus.org", "b.barracudacentral.org", "bl.spamcop.net"].forEach((e, t) => {
                    document.getElementById(t + 1 + "-provider").innerHTML = "Listed=" + n[e];
                });
        }),
        (s.onerror = function () {
            const e = document.getElementById("Submit");
            let t = 60;
            const r = setInterval(() => {
                (e.innerHTML = `Please Wait for ${t} seconds`), 0 == t && (clearInterval(r), (e.innerHTML = "Check"), e.removeAttribute("disabled")), t--;
            }, 1e3);
            e.setAttribute("disabled", "true"), s.close();
            var n = o.querySelector(".loader");
            n && n.classList.remove("shown");
        });
}
async function handleBulkBlacklist(e, t) {
    e.preventDefault();
    const r = t.closest("form");
    if (r)
        try {
            if (r.checkValidity()) {
                const s = r.querySelector(".loader");
                s && s.classList.add("shown");
                var n = await grecaptcha.execute("6Lf4b68qAAAAAC-7ubJT6SZQtzOkheapS0gR4wMb", { action: "submit" }),
                    o = new FormData(r);
                o.set("g-recaptcha-response", n),
                    (document.getElementById("about").style.display = "none"),
                    document.getElementById("custom_btn").getAttribute("disabled") ? o.set("type_form", "custom") : o.set("type_form", "bulk"),
                    fetch("/get-ips", { method: "POST", body: o })
                        .then((e) =>
                            e.ok
                                ? e.json()
                                : e.json().then((e) => {
                                      if (e["range-error"]) throw new Error(e["range-error"] || "An error occurred.");
                                      if (e["limit-error"]) throw new Error(e["limit-error"] || "An error occurred.");
                                  }),
                        )
                        .then((e) => {
                            e = e.ips;
                            fetch("/get-bulkblacklist-table-template", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ips: e }) })
                                .then((e) => e.text())
                                .then((e) => {
                                    Date.now();
                                    localStorage.setItem("startTime", Date.now() + 6e4), (document.getElementById("error-message").innerText = "");
                                    var t = document.getElementById("bulkblacklist-ajax-table");
                                    (document.getElementById("table").style.display = "block"), (t.innerHTML = e), get_results(r);
                                })
                                .catch((e) => {
                                    console.error("Error fetching the table:", e);
                                });
                        })
                        .catch((e) => {
                            (document.getElementById("error-message").innerText = e), s && s.classList.remove("shown");
                        });
            } else r.reportValidity();
        } catch (e) {
            console.error("An error occurred", e);
        }
    else console.error("No parent form found!");
}
