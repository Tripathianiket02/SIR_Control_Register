import { IITMaster } from "../../INTERFACE/IITMaster";
import { IItProps } from "../../../components/IItProps";
import SPCRUDOPS from "../../DAL/spcrudops";
export interface IIITRequestsOps {
    getIITMasterData(props: IITMaster): Promise<IITMaster>;
    getITDatafilter(props: IITMaster): Promise<IITMaster>;    
}

export default function IITRequestsOps() {
    const spCrudOps = SPCRUDOPS();

// const getIITMasterData = async (strFilter: string, sorting: any,props: IItProps): Promise<IITMaster[]> => {
    const getIITMasterData = async (sorting: any,props: IItProps): Promise<IITMaster[]> => {
        return await (await spCrudOps).getData("IT"
            , "*,PlantCode/PlantCode,Category/Category,Category/ID,SubCategory/SubCategory,SubCategory/ID,AddType/TypeName,AddType/ID,BillingCycle/BillingCycle,BillingCycle/ID,BillingMonth/Month,BillingMonth/Id,Year/Year,Year/ID,Editor/Title,Editor/ID,GroupApprover/Title,GroupApprover/Id,Site/Site,Site/ID,Domain/Domain"
            , "PlantCode,Category,SubCategory,AddType,BillingCycle,BillingMonth,Year,Editor,GroupApprover,Site,Domain"
            , ""
            , sorting
            , props).then(results => {
                let brr: Array<IITMaster> = new Array<IITMaster>();
                results.map((item: {PlantCodeId?: number;                    
                CategoryId:any;
                Category:any;
                Domain:any;
                SubCategory:any;
                AddType:any;
                Location :any;
                OTC:any;
                Recurring:any;
                BillingCycle:any; 
                Id:any;
                BillingMonth: any;
                BillingMonthId:any;
                Year: any;                    
                Budgeted:any;
                PONumber:any;
                POValue:any;
                Total:any;
                Actual:any;
                ProjectName:any;
                Created:any;
                PlantCode:any;
                Editor:any;
                Modified:any;
                RenewalDate:any; 
                GroupApproverId:any;
                Site:any;  
                SiteId:any;
                Costperunit:any;
                Quantity:any;  
                Total2:any;
                SiteBudgeted:any;
                ProcuredQty:any;
                BalanceQty:any;
                TotalCost:any;                                
                    }) => {
                    brr.push({                                                 
                    Id:item.Id,
                    PlantCodeId: item.PlantCode.PlantCode,
                    PlantCode:item.PlantCodeId,
                    CategoryId: item?.Category?.ID?? null,
                    SubCategoryId:item?.SubCategory?.ID?? null,
                    Domain:item?.Domain?.Domain?? null, 
                    SubCategory:item?.SubCategory?.SubCategory?? null,
                    AddTypeId:item?.AddType?.ID?? null,
                    BillingCycleId:item?.BillingCycle?.ID?? null,
                    BillingCycle:item?.BillingCycle?.BillingCycle?? null,
                    AddType:item?.AddType?.TypeName?? null,
                    Year:item?.Year?.Year?? null,
                    BillingMonth:item?.BillingMonth?.Month?? null,
                    BillingMonthId:item?.BillingMonthId?? null,
                    YearId:item?.Year?.ID?? null,
                    Location:item?.Location?? null,
                    OTC:item?.OTC?? null,
                    Recurring:item?.Recurring?? null,                        
                    Budgeted:item?.Budgeted?? null,
                    PONumber:item?.PONumber?? null,
                    POValue:item?.POValue?? null,
                    Total:item?.Total?? null,
                    Actual:item?.Actual?? null,
                    ProjectName:item?.ProjectName?? null,
                    Created:item?.Created?? null,
                    Editor:item?.Editor.Title?? null,
                    Modified:item?.Modified?? null,
                    RenewalDate:item?.RenewalDate?? null,
                    Category:item?.Category?.Category?? null,
                    GroupApproverId:item?.GroupApproverId?? null,
                    Site: item.Site ? item.Site.Site : '',
                    SiteId:item?.SiteId?? null,
                    Costperunit:item?.Costperunit?? null,
                    Quantity:item?.Quantity?? null,
                    Total2:item?.Total2?? null,
                    SiteBudgeted:item?.SiteBudgeted?? null,
                    ProcuredQty:item?.ProcuredQty?? null,
                    BalanceQty:item?.BalanceQty?? null,
                    TotalCost:item?.TotalCost?? null
                    });
                });
                return brr;
            }
        );
};

const getITDatafilter = async (ArtId: string | number,props: IItProps): Promise<IITMaster[]> => {
    return await (await spCrudOps).getData("IT"
            , "*,PlantCode/PlantCode,Category/Category,Category/ID,SubCategory/SubCategory,SubCategory/ID,AddType/TypeName,AddType/ID,BillingCycle/BillingCycle,BillingCycle/ID,BillingMonth/Month,BillingMonth/Id,Year/Year,Year/ID,Editor/Title,Editor/ID,GroupApprover/Title,GroupApprover/Id,Site/Site,Site/ID,Domain/Domain,Domain/ID"
            , "PlantCode,Category,SubCategory,AddType,BillingCycle,BillingMonth,Year,Editor,GroupApprover,Site,Domain"
            , "Id eq '"+ArtId+"'"
      // , sorting,
     ,{ column: 'Order0', isAscending: true },
         props).then(results => {
            let brr: Array<IITMaster> = new Array<IITMaster>();
            results.map((item: { PlantCodeId?: number;
                CategoryId:any;
                Category:any;
                Domain:any;
                SubCategory:any;
                AddType:any;
                Location :any;
                OTC:any;
                Recurring:any;
                BillingCycle:any; 
                Id:any;
                BillingMonth: any;
                BillingMonthId:any;
                Year: any;                    
                Budgeted:any;
                PONumber:any;
                POValue:any;
                Total:any;
                Actual:any;
                ProjectName:any;
                Created:any;
                PlantCode:any;
                Editor:any;
                Modified:any;
                RenewalDate:any; 
                GroupApproverId:any;
                Site:any;  
                SiteId:any;
                Costperunit:any;
                Quantity:any;  
                Total2:any;
                SiteBudgeted:any;
                ProcuredQty:any;
                BalanceQty:any;
                TotalCost:any;
                }) => {
                brr.push({
                    Id:item.Id,
                    PlantCodeId: item.PlantCode.PlantCode,
                    PlantCode:item.PlantCodeId,
                    CategoryId: item?.Category?.ID?? null,
                    SubCategoryId:item?.SubCategory?.ID?? null, 
                    DomainId:item?.Domain?.ID?? null,
                    Domain:item?.Domain?.Domain?? null,
                    SubCategory:item?.SubCategory?.SubCategory?? null,
                    AddTypeId:item?.AddType?.ID?? null,
                    BillingCycleId:item?.BillingCycle?.ID?? null,
                    BillingCycle:item?.BillingCycle?.BillingCycle?? null,
                    AddType:item?.AddType?.TypeName?? null,
                    Year:item?.Year?.Year?? null,
                    BillingMonth:item?.BillingMonth?.Month?? null,
                    BillingMonthId:item?.BillingMonthId?? null,
                    YearId:item?.Year?.ID?? null,
                    Location:item?.Location?? null,
                    OTC:item?.OTC?? null,
                    Recurring:item?.Recurring?? null,                        
                    Budgeted:item?.Budgeted?? null,
                    PONumber:item?.PONumber?? null,
                    POValue:item?.POValue?? null,
                    Total:item?.Total?? null,
                    Actual:item?.Actual?? null,
                    ProjectName:item?.ProjectName?? null,
                    Created:item?.Created?? null,
                    Editor:item?.Editor.Title?? null,
                    Modified:item?.Modified?? null,
                    RenewalDate:item?.RenewalDate?? null,
                    Category:item?.Category?.Category?? null,
                    GroupApproverId:item?.GroupApproverId?? null,
                    Site: item.Site ? item.Site.Site : '',
                    SiteId:item?.SiteId?? null,
                    Costperunit:item?.Costperunit?? null,
                    Quantity:item?.Quantity?? null,
                    Total2:item?.Total2?? null,
                    SiteBudgeted:item?.SiteBudgeted?? null,
                    ProcuredQty:item?.ProcuredQty?? null,
                    BalanceQty:item?.BalanceQty?? null,
                    TotalCost:item?.TotalCost?? null
                });
            });
            return brr;
        }
    );
};

return {
    getIITMasterData,getITDatafilter
    };
}