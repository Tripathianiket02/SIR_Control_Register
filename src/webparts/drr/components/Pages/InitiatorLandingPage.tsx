// Top-level imports stay mostly unchanged
import * as React from 'react';
import { useState, useEffect } from 'react';
import * as moment from 'moment';
import { Formik, FormikProps } from 'formik';
import { Icon } from '@fluentui/react/lib/Icon';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack } from '@fluentui/react/lib/Stack';
import ReactPaginate from 'react-paginate';
import { CSVLink } from "react-csv";
import USESPCRUD from '../../service/BAL/SPCRUD/spcrud';
import { Link, useHistory } from 'react-router-dom';
import { IDrrProps } from "../IDrrProps";
import { IDRRMaster } from '../../service/INTERFACE/IDRRMaster';
import IDRRRequestsOps from '../../service/BAL/SPCRUD/IDRRMaster';
import Utilities from '../../service/BAL/SPCRUD/utilities';
import { IPlantCodeMaster } from '../../service/INTERFACE/IPlantCodeMaster';
import PlantCodeRequestsOps from '../../service/BAL/SPCRUD/PlantCodeMaster';
import styles from '../Drr.module.scss';
import './Landing.scss';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
//Date
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { DayOfWeek } from '@fluentui/react';

export const InitiatorLanding: React.FunctionComponent<IDrrProps> = (props: IDrrProps) => {
  const history = useHistory();

  // State declarations
  const [allData, setAllData] = useState<IDRRMaster[]>([]);
  const [filteredData, setFilteredData] = useState<IDRRMaster[]>([]);
  const [currentPageData, setCurrentPageData] = useState<IDRRMaster[]>([]);
  const [currentusergroup, setcurrentusergroup] = useState<any[]>([]);
  const [plantCodes, setPlantCodes] = useState<IPlantCodeMaster[]>([]);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [pageCount, setPageCount] = useState(0);
  const [spCrud, setSPCRUD] = useState(null);
  const [utility, setUtility] = useState(null);

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      const userId = props.currentSPContext.pageContext.legacyPageContext.userId;
      const data = await IDRRRequestsOps().getIDRRMasterData({ column: 'Modified', isAscending: false }, props);
    
      const spCrudObj = await USESPCRUD();                
      const CurrentuserGroup = await spCrudObj.getLoggedInSiteGroups(props);
      console.log(CurrentuserGroup);
    
      const Currentloggedin = CurrentuserGroup.map(group => group.Id);
      
      // Filter and sort data
      const Newdata = data
        .filter(item => Array.isArray(item.GroupApproverId) && item.GroupApproverId.some(id => Currentloggedin.includes(id)))
        .sort((a, b) => {          
          if (new Date(b.Modified).getTime() === new Date(a.Modified).getTime()) {
            return b.Id - a.Id;
          }
          return new Date(b.Modified).getTime() - new Date(a.Modified).getTime();
        });
      
      setcurrentusergroup(Currentloggedin);
      setAllData(Newdata);
      setFilteredData(Newdata);
    }       
    
    fetchData();

    PlantCodeRequestsOps().getPlantCodeData(props).then(setPlantCodes);
  }, []);

  // Apply pagination whenever filteredData or offset changes
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const current = filteredData.slice(itemOffset, endOffset);
    setCurrentPageData(current);
    setPageCount(Math.ceil(filteredData.length / itemsPerPage));
  }, [filteredData, itemOffset]);

  // Pagination change handler
  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % filteredData.length;
    setItemOffset(newOffset);
  };

  // Filter by search input
  const onBlockRequestSearch = async (filterValue: string) => {
    const util = await Utilities();
    setUtility(util);
    const filtered = await util.filterData(allData, filterValue, ["ProjectCode","ProjectCodeId","PlantCode","PlantCodeId","ProjectName","Location","Opening","Receipt","ReceiptLocalfromAuthorisedPump","IssueOwnconsumption","IssueChargeable","Closing","Remarks","Created"]);
    setFilteredData(filtered);
    setItemOffset(0); // reset pagination
  };

  // Filter by Plant Code
  const onChangePlantCode = (e, formik) => {
    const value = e.target.value;
    formik.setFieldValue('PlantCodeId', value);
    const filtered = value ? allData.filter(item => item.PlantCodeId == parseInt(value)) : allData;
    setFilteredData(filtered);
    setItemOffset(0);
  };

  // Date filtering
  const formatLocalDate = (dateStr) => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  const onRequestInitiate = (formValues) => {
    const { Fromdate, Enddate } = formValues;
  
    const from = formatLocalDate(Fromdate);
    const to = formatLocalDate(Enddate);
  
    const filtered = allData.filter(item => {
      const created = item.Created.split('T')[0];
      return created >= from && created <= to;
    });
  
    setFilteredData(filtered);
    setItemOffset(0);
  };   

  const onRequestReset = () => {
    setFilteredData(allData);
    setItemOffset(0);
  };

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm("Are you sure you want to delete?");
    if (confirmed) {
      const sp = await USESPCRUD();
      await sp.deleteData("WeeklyDiesel", itemId, props);
      alert("Deleted");
      window.location.reload(); // optional: can be optimized to re-fetch
    }
  };

  const getFieldProps = (formik: FormikProps<any>, field: string) => ({
    ...formik.getFieldProps(field),
    errorMessage: formik.errors[field] as string
  });

  const initialValues = {
    Response:'',
    Enddate:'',
    Fromdate:''
      };
      
      const headers = [    
        { label: "Project Code", key: "ProjectCode" },
        { label: "Plant Code", key: "PlantCode" },
        { label: "Project Name", key: "ProjectName" },
        { label: "Location", key: "Location" },
        { label: "Opening", key: "Opening" },
        { label: "Receipt (Direct from IOCL/ BPCL/ HPCL Depot)", key: "Receipt" },
        { label: "Receipt (Local from Authorised Pump)", key: "ReceiptLocalfromAuthorisedPump" },
        { label: "Issue (Own consumption)", key: "IssueOwnconsumption" },
        { label: "Issue (Chargeable)", key: "IssueChargeable" },
        { label: "Closing", key: "Closing" }        
      ];

  return (
    <Formik initialValues={initialValues} onSubmit={() => { }}>
      {formik => (
        <div className="main">
          {/* Actions & Filters */}          

          <div className='element-actions'>
          <span className={ styles.btnnew} style={{background:'#c4291c', borderColor:'border-color'}}><Link to="/"><Icon iconName="AddTo" style={{fontSize:'18px', paddingRight:'7px', paddingTop:'3px',marginRight:'18px'}} /> New Request</Link></span>
          </div>

          <div  className={styles.innertabs}>
          <div className="p-3 bg-white shadow-sm border">
            <h3 className={`${styles.headingh1} elementheading`}>MIS_6_Weekly Diesel Receipt Report</h3>
    
    <div className='row mr--1' style={{display:'flex',flexWrap: 'wrap',marginRight: '15px'}}>
    
    <div className='col-md-3'>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <label htmlFor="txtstartdate" className='col-form-label mb-0'>
      From Date
    </label>
    <DatePicker
      id="txtstartdate"
      placeholder="Enter or select a date"
      allowTextInput={true}
      firstDayOfWeek={DayOfWeek.Sunday}
      value={formik.values.Fromdate ? new Date(formik.values.Fromdate) : undefined}
      onSelectDate={(date) => formik.setFieldValue('Fromdate', date?.toISOString())}
      parseDateFromString={(input) => {
        const parts = input.split(/[\/\-]/).map(p => p.trim());
        const today = new Date();

        if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
          return new Date(today.getFullYear(), today.getMonth(), parseInt(parts[0]));
        }

        if (parts.length === 2 && /^\d{1,2}$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1])) {
          return new Date(today.getFullYear(), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }

        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day);
          }
        }

        return undefined;
      }}
      formatDate={(date) =>
        date
          ? `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`
          : ''
      }
      styles={{ root: { width: '100%' } }}
    />
    </div>

    {formik.errors.Fromdate && (
    <div style={{ paddingTop: 4, color: "#B2484D", fontSize: ".75rem", fontFamily: "Segoe UI" }}>
      {formik.errors.Fromdate}
    </div>
    )}
    </div>

    <div className='col-md-3'>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <label htmlFor="txtenddate" className='col-form-label mb-0'>
      End Date
    </label>
    <DatePicker
      id="txtenddate"
      placeholder="Enter or select a date"
      allowTextInput={true}
      firstDayOfWeek={DayOfWeek.Sunday}
      value={formik.values.Enddate ? new Date(formik.values.Enddate) : undefined}
      onSelectDate={(date) => formik.setFieldValue('Enddate', date?.toISOString())}
      parseDateFromString={(input) => {
        const parts = input.split(/[\/\-]/).map(p => p.trim());
        const today = new Date();

        if (parts.length === 1 && /^\d{1,2}$/.test(parts[0])) {
          return new Date(today.getFullYear(), today.getMonth(), parseInt(parts[0]));
        }

        if (parts.length === 2 && /^\d{1,2}$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1])) {
          return new Date(today.getFullYear(), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }

        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day);
          }
        }

        return undefined;
      }}
      formatDate={(date) =>
        date
          ? `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`
          : ''
      }
      styles={{ root: { width: '100%' } }}
    />
    </div>

    {formik.errors.Enddate && (
    <div style={{ paddingTop: 4, color: "#B2484D", fontSize: ".75rem", fontFamily: "Segoe UI" }}>
      {formik.errors.Enddate}
    </div>
    )}
    </div>

    <div className='col-md-3 mt--4'>
    <PrimaryButton
    type='submit'
    style={{ background:' #c4291c'}}
    className={styles.btnprimary + ' ' + 'pr1'}
    text='Search'
    onClick={async () => {await onRequestInitiate(formik.values);}}
    value={'Submitted'}
    iconProps={{ iconName: 'Search' }} />
    <PrimaryButton
    type='submit'
    style={{  background:' #c4291c' , width:'120px'}}
    className={styles.btnprimary + ' ' + 'pr1'}
    text='Reset'
    onClick={async () => 
    { 
      await onRequestReset();
      formik.setFieldValue('PlantCodeId', '');
      formik.setFieldValue('Fromdate', '');
      formik.setFieldValue('Enddate', '');
    }}
    value={'Submitted'}
    iconProps={{ iconName: 'Reset' }} />
    </div>

    <div className='col-md-3'>
    <Stack>
    <SearchBox placeholder="Search" className="sbtn"
    onSearch={newValue => onBlockRequestSearch(newValue)}
    onClear={ev => onBlockRequestSearch('')}
    onBlur={ev => onBlockRequestSearch(ev.target.value)} />
    </Stack>                        
    </div>    

    <div className='col-md-3 mt--2'>
    <div className='form-group'>
    <label className='col-form-label mr-2'>Plant Code</label>
    <select id='ddlPlantCode' className='form-control' {...getFieldProps(formik, 'PlantCodeId')} onChange={async (e) => {              
    formik.setFieldValue('PlantCodeId', e.target.value);
    await onChangePlantCode(e,formik);              
    }}>
    <option value="">Select</option>
    {plantCodes !== undefined ? plantCodes.map((Vend) => <option key={Vend.Id} value={Vend.Id}>{Vend.PlantCode}</option>) : ''}
    </select>                 
    </div>
    </div>

    {/* <div className='col-md-2' style={{textAlign:'left', fontSize: "13px" , marginTop:'3px'}}>
    <div className="excel" style={{border: '1px solid #c4291c',padding: "5px",width:'calc(100% - 40px)',backgroundColor:'#c4291c',borderRadius:'3px',height:'35px', textAlign:'center'}}>
    {paginatedPurchaseRequestsColl != undefined && paginatedPurchaseRequestsColl.length > 0 ?
    <CSVLink data={paginatedPurchaseRequestsColl} headers={headers} filename={'InitiatorLanding.csv'} style={{textDecoration: 'none',color:'white'}}>                
    <Icon iconName="ExcelDocument"style={{color:'white'}} /> <span className='pl-2'style={{color:'#fff', paddingLeft:'7px'}}>Export to Excel</span>
    </CSVLink> :
    ''}
    </div> 
    </div>*/}

    <div className="col-md-2" style={{textAlign:'left', fontSize: "13px" , marginTop:'3px'}}>
    <div className="excel" style={{border: '1px solid #c4291c',padding: "5px",width:'calc(100% - 40px)',backgroundColor:'#c4291c',borderRadius:'3px',height:'35px', textAlign:'center'}}>
      {filteredData.length > 0 && (
        <CSVLink data={filteredData} headers={headers} filename="InitiatorLanding.csv" style={{textDecoration: 'none',color:'white'}}>
          <Icon iconName="ExcelDocument" style={{color:'white'}}/> <span className='pl-2'style={{color:'#fff', paddingLeft:'7px'}}>Export to Excel</span>
        </CSVLink>
      )}
      </div>
    </div>
    </div>
                   

            {/* Table Section */}
            <div style={{ overflowX: 'auto' }}>
              <table className={`${styles.tblrequest} ${styles.tablebordered}`}>
                <thead>
                  <tr>
                    <th>Edit</th>
                    <th>Delete</th>
                    <th>Project Code</th>
                    <th>Plant Code</th>
                    <th>Project Name</th>
                    <th>Opening</th>
                    <th>Receipt (Direct from IOCL/ BPCL/ HPCL Depot)</th>
                    <th>Receipt (Local from Authorised Pump)</th>
                    <th>Issue (Own consumption)</th>
                    <th>Issue (Chargeable)</th>
                    <th>Closing</th>                                        
                    <th>Location</th>                    
                    <th>Last Modified By</th>
                    <th>Last Modified Date</th>
                  </tr>
                </thead>
                <tbody>
                {currentPageData && currentPageData.length > 0 ? (
                  currentPageData.map(row => (
                    <tr key={row.Id}>
                      <td style={{textAlign:'center'}}>
                        <Link to={`/EditRequest/${row.Id}`}>
                          <Icon iconName="PageEdit" className={styles.icon}/>
                        </Link>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <Icon iconName="Delete" className={styles.icon} onClick={() => handleDelete(row.Id)} />
                      </td> 
                      <td>{row.ProjectCode}</td>
                      <td>{row.PlantCode}</td>
                      <td>{row.ProjectName}</td>
                      <td>{row.Opening}</td>
                      <td>{row.Receipt}</td>
                      <td>{row.ReceiptLocalfromAuthorisedPump}</td>
                      <td>{row.IssueOwnconsumption}</td>  
                      <td>{row.IssueChargeable}</td>
                      <td>{row.Closing}</td>                      
                      <td>{row.Location}</td>
                      <td>{row.Editor?.Title || ''}</td>
                      <td>{row.Modified ? moment(row.Modified).format("DD/MM/YYYY") : ''}</td>                                                                    
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{textAlign: 'center'}}>No data available</td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <ReactPaginate
              breakLabel="..."
              nextLabel="Next"
              previousLabel="Previous"
              pageRangeDisplayed={5}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              className="pagination"
            />
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
};
