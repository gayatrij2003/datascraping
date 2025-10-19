function approveUser(email) {
    let approveFormElement = document.getElementById("approve-user");
    approveFormElement.onsubmit = function (e) {
        e.preventDefault();
        fetch(`/portal/dashboard-users-actions?email=${email}&action=Approved`, { method: "POST" })
            .then((resp) => {
                return resp.json();
            })
            .then((res) => {
                window.location.reload();
            });
    };
}
function denyUser(email) {
    let approveFormElement = document.getElementById("deny-user");
    approveFormElement.onsubmit = function (e) {
        e.preventDefault();
        fetch(`/portal/dashboard-users-actions?email=${email}&action=Deny`, { method: "POST" })
            .then((resp) => {
                return resp.json();
            })
            .then((resp) => {
                window.location.reload();
            });
    };
}
function deleteUser(email) {
    let approveFormElement = document.getElementById("delete-user");
    approveFormElement.onsubmit = function (e) {
        e.preventDefault();
        fetch(`/portal/dashboard-users-actions?email=${email}&action=Deny`, { method: "POST" })
            .then((resp) => {
                return resp.json();
            })
            .then(() => {
                window.location.reload();
            });
    };
}
