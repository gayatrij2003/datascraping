function callFetchURL(url, formdata, fetchMethod) {
    fetch(url, { method: "POST", body: formdata })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then((response) => {
            const ips = response.ips;
            ips.forEach((ip) => {
                const statusTd = document.getElementById(`${ip}-01`);
                if (statusTd) {
                    statusTd.innerHTML = "";
                    const inSpinn = document.createElement("div");
                    inSpinn.classList.add("spinner");
                    statusTd.appendChild(inSpinn);
                }
            });

            // const subButtons = document.getElementsByClassName()
            document.querySelectorAll(".fetch-ips").forEach((fetchBtn) => {
                let coundown = 15;
                const timer = setInterval(() => {
                    fetchBtn.innerHTML = `Please Wait for ${coundown} seconds`;
                    if (coundown == 0) {
                        clearInterval(timer);
                        fetchBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Fetch IPs';
                        fetchBtn.removeAttribute("disabled");
                    }
                    coundown--;
                }, 1000);
                fetchBtn.setAttribute("disabled", "true");
            });
            fetchips(fetchMethod);
        })
        .catch((error) => {
            addLimitErrorAlert(true);
        });
}

function fetchSingleIPs(event, ipaddressId) {
    event.preventDefault();
    let url = "/fetch-ips";
    let fetchMethod = "";

    const formdata = new FormData();
    formdata.append("inputvalue", ipaddressId);

    callFetchURL(url, formdata, fetchMethod);
}

function fetchips(method) {
    let eventsource = null;
    if (method) {
        eventsource = new EventSource("/portal/fetch-ips-stream");
    } else {
        eventsource = new EventSource("/fetch-ips-stream");
    }
    eventsource.onmessage = function (event) {
        const { data } = JSON.parse(event.data);
        const spinnTd = document.getElementById(`${data.ip}-01`);
        if (spinnTd) {
            spinnTd.innerHTML = data.ip;
            if (data.result.is_blacklisted) {
                spinnTd.className = "tb-detected";
            } else {
                spinnTd.className = "tb-detected1";
            }
        }
    };
    eventsource.onerror = function () {
        eventsource.close();
    };
}
function callFetchIPs(event, method) {
    let fetchMethod = "";
    event.preventDefault();
    let url = "/fetch-ips";
    if (method) {
        if (method == "portal") {
            url = "/portal/fetch-ips";
            fetchMethod = method;
        }
    }

    const parentDiv = event.target.closest("div");
    const inputDiv = parentDiv.previousElementSibling;

    const inputValue = inputDiv.value;

    const formdata = new FormData();
    formdata.append("inputvalue", inputValue);

    callFetchURL(url, formdata, fetchMethod);
}
function fetchrdns(method) {
    let eventsource = null;
    if (method) {
        eventsource = new EventSource("/portal/fetch-rdns-stream");
    } else {
        eventsource = new EventSource("/fetch-rdns-stream");
    }
    eventsource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const spinnTd = document.getElementById(`${data.ip}-02`);
        if (spinnTd) {
            spinnTd.innerHTML = data.rdns;
        }
    };
    eventsource.onerror = function () {
        eventsource.close();
    };
}
function callFetchRdns(event, method) {
    event.preventDefault();
    let fetchMethod = "";
    url = "/fetch-rdns";
    if (method) {
        if (method == "portal") {
            url = "/portal" + url;
            fetchMethod = method;
        }
    }

    const parentDiv = event.target.closest("div");
    const inputDiv = parentDiv.previousElementSibling.previousElementSibling;

    const inputValue = inputDiv.value;

    const formdata = new FormData();
    formdata.append("inputvalue", inputValue);

    fetch(url, { method: "POST", body: formdata })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then((response) => {
            const ips = response.ips;

            ips.forEach((ip) => {
                const statusTd = document.getElementById(`${ip}-02`);
                if (statusTd) {
                    statusTd.innerHTML = "";
                    const inSpinn = document.createElement("div");
                    inSpinn.classList.add("spinner");
                    statusTd.appendChild(inSpinn);
                }
            });

            // const subButtons = document.getElementsByClassName()
            document.querySelectorAll(".fetch-rdns").forEach((fetchBtn) => {
                let coundown = 15;
                const timer = setInterval(() => {
                    fetchBtn.innerHTML = `Please Wait for ${coundown} seconds`;
                    if (coundown == 0) {
                        clearInterval(timer);
                        fetchBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Fetch RDNS';
                        fetchBtn.removeAttribute("disabled");
                    }
                    coundown--;
                }, 1000);
                fetchBtn.setAttribute("disabled", "true");
            });
            fetchrdns(fetchMethod);
        })
        .catch((error) => {
            addLimitErrorAlert(true);
        });
}
function showComponent(button, user_type = "user") {
    const name = button.name;
    let form = button.closest("form");
    const components = document.querySelectorAll(".component");
    components.forEach((component) => {
        component.style.display = "none";
    });
    const buttons = document.querySelectorAll(".modal-button");
    buttons.forEach((button1) => {
        button1.removeAttribute("disabled");
    });

    let url_prefix = "";
    if (user_type == "admin") {
        url_prefix = "/portal";
    }
    if (name == "range") {
        form.action = url_prefix + "/ips-add-range";
    } else if (name == "custom") {
        form.action = url_prefix + "/ips-add-custom";
    } else if (name == "file-input") {
        form.action = url_prefix + "/ips-add-csv";
        form.enctype = "multipart/form-data";
    }

    const allInputs = form.querySelectorAll("[data-required]");
    allInputs.forEach((input) => {
        input.removeAttribute("required");
    });
    button.setAttribute("disabled", "true");
    const matchingComponent = document.getElementById(name);

    const requiredData = matchingComponent.querySelectorAll("[data-required]");

    requiredData.forEach((input) => {
        input.setAttribute("required", "true");
    });

    if (matchingComponent) {
        matchingComponent.style.display = "block";
    }
}
function editIP(ip_obj) {
    const [ip, ipgroup_id, ipowner] = ip_obj.split("|");
    let ipaddress_old = document.getElementById("ipaddress_old");
    ipaddress_old.value = ip;
    let ipaddress = document.getElementById("ipaddress");
    ipaddress.value = ip;
    let ipgroup = document.getElementById("ipgroup");
    ipgroup.value = ipgroup_id;
    for (let option of ipgroup.options) {
        if (option.value === ipgroup_id) {
            option.disabled = true;
            break;
        }
    }
    if (ipowner) {
        let ip_owner = document.getElementById("ipowner");
        ip_owner.value = ipowner;
    }
}

function ip_history_by_provider(event, ipaddress){
    event.preventDefault();
    console.log(event.target.value, ipaddress)

    const provider = event.target.value
    const formdata = new FormData();
    formdata.set("ipaddress", ipaddress)
    formdata.set("provider", provider)

    fetch("/ip-history", {method: "POST", body: formdata}).then((response)=> {
        return response.json()
    }).then(data=> {
        const resTable = document.getElementById("historyModalResult");

        const response = data.ipstatus

        const newResp = []

        for(let status of response){
            const blacklisted = status.blacklist_date
            newResp.unshift({"status": "blacklisted", date: blacklisted})
            const cleaned = status.clean_date
            if( !cleaned) {
                break;
            }
            newResp.unshift({"status": "cleaned", date: cleaned})
        }

        const restable = document.createElement('table')
        const table_thead = document.createElement('thead')
        const table_head_tr = document.createElement('tr')
        const table_td1 = document.createElement('td')
        table_td1.innerHTML = "Status"
        table_head_tr.append(table_td1)
        const table_td2 = document.createElement('td')
        table_td2.innerHTML = "Date"
        table_head_tr.append(table_td2)
        table_thead.append(table_head_tr)
        restable.append(table_thead)

        const table_body = document.createElement('tbody')

        for (let status of newResp){
            const tbody_tr = document.createElement('tr')
            tbody_tr.style.textTransform = "capitalize"
            if(status.status == "blacklisted") {
                tbody_tr.style.backgroundColor = "red" 
            } else {
                tbody_tr.style.backgroundColor = "green" 
            }
            tbody_tr.style.color = "white"
            const td1 = document.createElement('td')
            td1.innerHTML = status.status
            const td2 = document.createElement('td')
            td2.innerHTML = status.date
            tbody_tr.append(td1)
            tbody_tr.append(td2)
            table_body.append(tbody_tr)
        }
        restable.append(table_body)
        resTable.innerHTML =""
        resTable.append(restable)
    })
}

function historyIP(ipaddress) {
    const formdata = new FormData();
    formdata.set("ipaddress", ipaddress)
    fetch("/ip-history-provider", { method: "POST", body: formdata }).then((response) => {
        if (!response.ok) {
        }
        return response.json();
    })
    .then((data)=>{
        const selTag = document.createElement('select')
        selTag.name = "providers"
        selTag.className = "text-dark rounded-3 px-4 py-2 border"
        selTag.addEventListener('change', (event)=>{
            ip_history_by_provider(event, data.ipaddress)

        })
        const optionsProv = []
        for(let provider of data.providers){
            if(optionsProv.includes(provider.provider)){
                continue
            }
            optionsProv.push(provider.provider)
        }
        let opt = document.createElement('option')
        opt.disabled = true
        opt.selected = true
        opt.text = "Select Provider"

        selTag.appendChild(opt)

        for(let provider of optionsProv){
            let option = document.createElement('option')
            option.text = provider
            option.value = provider
            selTag.appendChild(option)
        }
        
        const historyModalTable = document.getElementById("historyModalTable")
        historyModalTable.innerHTML = ""
        historyModalTable.appendChild(selTag)

    })
}

function handleFormSubWithRecaptcha(event, formid) {
    event.preventDefault();
    window.formid = formid;
    grecaptcha.execute();
}

function handleAddIPGroup(event) {
    event.preventDefault();
    document.getElementById("ipgroupnamediv").classList.toggle("d-none");
    document.getElementById("ipgroupname").disabled = false;
}

function onCancel(event) {
    event.preventDefault();
    document.getElementById("ipgroupnamediv").classList.toggle("d-none");
}

let queryTimer = null;

function checkname(event) {
    if (queryTimer) {
        clearTimeout(queryTimer);
    }

    let query = event.target.value;
    if (query) {
        queryTimer = setTimeout(() => {
            fetch("/check-ipgroup-name" + "?query=" + query)
                .then((response) => response.json())
                .then((response) => {
                    if (response.exists) {
                        document.getElementById("ip-group-name-button").disabled = true;
                        document.getElementById("ipgroupname").classList.add("is-invalid");
                        document.getElementById("ipgroupname").classList.remove("is-valid");
                    } else {
                        document.getElementById("ip-group-name-button").disabled = false;
                        document.getElementById("ipgroupname").classList.add("is-valid");
                        document.getElementById("ipgroupname").classList.remove("is-invalid");
                    }
                });
        }, 1000);
    } else {
        document.getElementById("ip-group-name-button").disabled = true;
        document.getElementById("ipgroupname").classList.remove("is-valid");
        document.getElementById("ipgroupname").classList.remove("is-invalid");
    }
}

function createIPGroup(event) {
    event.preventDefault();
    let ipgroupname = document.getElementById("ipgroupname").value;

    fetch("/create-ipgroup" + "?group_name=" + ipgroupname)
        .then((response) => response.json())
        .then((response) => {
            if (response.added) {
                let id = response.id;

                let selectTag = document.getElementById("ipgroup");

                let opt = document.createElement("option");

                opt.value = id;
                opt.innerHTML = ipgroupname;
                opt.selected = true;
                selectTag.appendChild(opt);

                document.getElementById("ipgroup").value = response.id;
                document.getElementById("ipgroupnamediv").classList.toggle("d-none");
                document.getElementById("ipgroupname").disabled = true;
                document.getElementById("ip-group-name-button").disabled = true;
                document.getElementById("ipgroupname").classList.remove("is-valid");
                document.getElementById("ipgroupname").classList.remove("is-invalid");
                document.getElementById("ipgroupname").value = "";
            } else {
                alert("Failed to create IP group");
            }
        });
}
