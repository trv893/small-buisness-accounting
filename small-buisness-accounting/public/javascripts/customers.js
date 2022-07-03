// creates abort controller for stopping fetch during autocomplete
var controller = new AbortController();
var signal = controller.signal;

//const failedlogin = function () {
//    localStorage.clear();
//    window.location = '/';

//};

// await the customer search then render the data
const doCustomerSearchUi = async (d) => {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    //Do new search
    var customerList = await searchCustomersApi();
    await renderCustomersFromData(customerList);
};
// start the customer search
const startup = async () => {
    await doCustomerSearchUi();
};



// calls the customer api with the contents of the customer search textbox as a query string
const searchCustomersApi = async () => {
    try {
        var r = await fetch("api/customer?q=" + $("#customer_search").val(), {
            // signal used to abort fetch
            headers: {
                Authorization: "Bearer " + localStorage.getItem("key"),
            },
            signal: signal,
        });
        var rd = await r.json();
        return rd;
    } catch (err) {
        /*failedlogin();*/
    }
};

 //renders results from customer fetch
function renderCustomersFromData(customerList) {
    customerList.forEach((customer) => {
        var customerhtml =
            `<li>
            <a class="d-flex btn btn-light shadow-sm m-1 EditCustomer" onclick="editCustomer(this)" id="customer_$(this.Id)" data-customer-id="$(this.Id)" data-bs-toggle="modal" data-bs-target="#editcustomerModal">
                <div class="p-2 col-9">
                    <div class="row datarow ">
                        <span class="text-uppercase list-primary"> $(this.FirstName) $(this.LastName) </span>
                    </div>
                    <div class="row datarow">
                        <span> $(this.Address), $(this.City) </span>
                    </div>
                </div>
                <div class="p-2 d-flex col-3">
                    <div class="row">
                        <div class="col">
                            <i onclick="location.href='tel:$(this.Phone1)'" class="bi btn btn-success bi-telephone ms-2 shadow">&nbsp;</i>
                            <i onclick="newproposalshow(this)" data-new-customer-id="$(this.Id)" data-proposal-customer-name="$(this.FirstName) $(this.LastName)" class="bi btn btn-success bi-file-earmark-medical ms-2 shadow" data-bs-toggle="modal" data-bs-target="#newProposalModal">&nbsp;</i>
                            <i onclick="newinvoiceshow(this)" data-new-invoice-customer-id="$(this.Id)" data-invoice-customer-name="$(this.FirstName) $(this.LastName)" class="bi btn btn-success bi-coin ms-2 shadow" data-bs-toggle="modal" data-bs-target="#newInvoiceModal">&nbsp;</i>
                        </div>
                    </div>
                </div>
            </a>
        </li>`
        var customerhtml = '<li>hi</li>`'
        $("#customerlist").append(customerhtml);

    })
};

startup();