import { IDomainMaster } from "../../INTERFACE/IDomainMaster";
import { IItProps } from "../../../components/IItProps";
import SPCRUDOPS from "../../DAL/spcrudops";

export interface IDomainMasterOps {
    getDomainMasterData(props: IDomainMaster): Promise<IDomainMaster>;
   
}
export default function DomainMasterOps() {
    const spCrudOps = SPCRUDOPS();

    const getDomainMasterData = async (props: IItProps): Promise<IDomainMaster[]> => {
        return await (await spCrudOps).getData("DomainMaster"
            , "*,Status,Domain"
            , ""
            , ""
          // , sorting,
         ,{ column: 'ID', isAscending: true },
             props).then(results => {
                let brr: Array<IDomainMaster> = new Array<IDomainMaster>();
                results.map((item: {  
                    Status :any;    
                    Domain:any;    
                    Title:any;
                    Id:any;
                    }) => {
                    brr.push({
                        Id:item.Id,                                              
                        Domain:item.Domain, 
                        Status:item.Status,
                        Title:item.Title                                               
                    });
                });
                return brr;
            }
            );
    //});
};

return {
    getDomainMasterData
    };
}