// ppdoc-scenario-loader.js — waits for fragments
(function(){
  document.addEventListener('smartui:fragmentsReady', init, { once:true });
  function init(){
    const WRAP=document.getElementById('scenarioSelector');
    if(!WRAP) return;
    fetch(`../scenarios/scenario-list.json?_=${Date.now()}`, { cache: 'no-store' })
      .then(r=>r.json())
      .then(list=>{
        dropdownCore.populate(WRAP,list.map(o=>({value:o.file,label:o.label})),file=>{
          fetch(`../scenarios/${file}`)
            .then(r=>r.json())
            .then(j=>{
              localStorage.setItem('smartui_rawScenario',JSON.stringify(j));
              localStorage.setItem('smartui_data',JSON.stringify(j));
              
              // Populate customer info fields with offset conversion (same as search)
              if (window.SEARCH_DEBUG && window.SEARCH_DEBUG.populateCustomerInfoFields) {
                window.SEARCH_DEBUG.populateCustomerInfoFields(j);
              }
              
              // Set up search fields to match a contract account search
              const searchTypeElement = document.getElementById('searchType');
              const findByElement = document.getElementById('findBy');
              
              if (searchTypeElement && findByElement && j.supplyInfo) {
                // Find the first available contract account (electricity or gas)
                let contractAccount = null;
                if (j.supplyInfo.electricity?.accountInfo?.contract_Account) {
                  contractAccount = j.supplyInfo.electricity.accountInfo.contract_Account;
                } else if (j.supplyInfo.gas?.accountInfo?.contract_Account) {
                  contractAccount = j.supplyInfo.gas.accountInfo.contract_Account;
                }
                
                if (contractAccount) {
                  // Set search field to contract account number and underline it
                  searchTypeElement.value = contractAccount;
                  searchTypeElement.style.textDecoration = 'underline';
                  
                  // Set dropdown to "Contract Account"
                  findByElement.value = 'findByContract_Account';
                  
                  console.log(`[SCENARIO] Set search fields to Contract Account: ${contractAccount}`);
                }
              }
              
              document.dispatchEvent(new Event('scenario:loaded'));
            });
        });
      });
  }
})();