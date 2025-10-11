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
import { IItProps } from "../IItProps";
import { IITMaster } from '../../service/INTERFACE/IITMaster';
import IITRequestsOps from '../../service/BAL/SPCRUD/ITMaster';
import Utilities from '../../service/BAL/SPCRUD/utilities';
import { IPlantCodeMaster } from '../../service/INTERFACE/IPlantCodeMaster';
import PlantCodeRequestsOps from '../../service/BAL/SPCRUD/PlantCodeMaster';
import styles from '../It.module.scss';
import './Landing.scss';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
//Date
import { DatePicker } from '@fluentui/react/lib/DatePicker';
import { DayOfWeek } from '@fluentui/react';
//MonthMaster
import { IMonthMaster } from '../../service/INTERFACE/IMonthMaster';
import MonthRequestsOps from '../../service/BAL/SPCRUD/MonthMaster';
import { string } from 'yup';


export const InitiatorLanding: React.FunctionComponent<IItProps> = (props: IItProps) => {
  const history = useHistory();

  // State declarations
  const [allData, setAllData] = useState<IITMaster[]>([]);
  const [filteredData, setFilteredData] = useState<IITMaster[]>([]);
  const [currentPageData, setCurrentPageData] = useState<IITMaster[]>([]);
  const [selectedView, setselectedView] = useState<string>('Site Budgeted');
  const [currentusergroup, setcurrentusergroup] = useState<any[]>([]);
  const [plantCodes, setPlantCodes] = useState<IPlantCodeMaster[]>([]);
  const [months, setMonths] = useState<IMonthMaster[]>([]);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  const [pageCount, setPageCount] = useState(0);
  const [spCrud, setSPCRUD] = useState(null);
  const [utility, setUtility] = useState(null);

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      const userId = props.currentSPContext.pageContext.legacyPageContext.userId;
      const data = await IITRequestsOps().getIITMasterData({ column: 'Modified', isAscending: false }, props);

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
      if (Newdata.length > 0) { handleViewChange2('Site Budgeted', Newdata); };
    }

    fetchData();

    PlantCodeRequestsOps().getPlantCodeData(props).then(setPlantCodes);
    MonthRequestsOps().getMonthData(props).then(setMonths);

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
    const filtered = await util.filterData(allData, filterValue, ["PlantCodeId", "ProjectName", "Location", "PONumber", "OTC", "Recurring", "POValue", "Total", "Actual", "CategoryId", "SubCategory", "AddTypeId", "BillingCycleId", "RenewalDate", "BillingMonthId", "YearId", "Budgeted", "Site", "Quantity", "Costperunit", "Total2"]);
    setFilteredData(filtered);
    setItemOffset(0); // reset pagination
  };

  // Filter by Plant Code
  const onChangePlantCode = (e, formik) => {
    const value = e.target.value;
    formik.setFieldValue('PlantCodeId', value);
    const filtered = value ? allData.filter(item => item.PlantCode == parseInt(value)) : allData;
    setFilteredData(filtered);
    setItemOffset(0);
  };

  // Filter by Payment Month
  const onChangePaymentMonth = (e, formik) => {
    const value = e.target.value;
    formik.setFieldValue('BillingMonthId', value);
    const filtered = value ? allData.filter(item => item.BillingMonthId == parseInt(value)) : allData;
    setFilteredData(filtered);
    setItemOffset(0);
  };

  const handleViewChange2 = (value: string, data) => {
    setselectedView(value);

    let filtered = [];

    if (value === 'Site Budgeted') {
      filtered = data.filter(item => item.SiteBudgeted === 'Yes');
    } else {
      filtered = data.filter(item => item.SiteBudgeted === null);
    }

    setFilteredData(filtered);
    setItemOffset(0);
  };

  const handleViewChange = (value: string) => {
    setselectedView(value);

    let filtered = [];

    if (value === 'Site Budgeted') {
      filtered = allData.filter(item => item.SiteBudgeted === 'Yes');
    } else {
      filtered = allData.filter(item => item.SiteBudgeted === null);
    }

    setFilteredData(filtered);
    setItemOffset(0);
  };

  const onChangeView = (e, formik) => {
    console.log("Triggered");
    handleViewChange(e.target.value);
  };

  // Format a date to 'yyyy-mm-dd' string for date-only comparison
  const formatLocalDate = (dateStr) => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const onRequestInitiate = (formValues) => {
    const { Fromdate, Enddate, RenewalMonth, RenewalYear } = formValues;

    // No filters provided
    if (!Fromdate && !Enddate && !RenewalMonth && !RenewalYear) {
      setFilteredData(allData);
      setItemOffset(0);
      return;
    }

    const from = Fromdate ? formatLocalDate(Fromdate) : null;
    const to = Enddate ? formatLocalDate(Enddate) : null;

    let filtered = [];

    // Filter by Created date range only if both from and to are provided
    if (from && to) {
      filtered = allData.filter(item => {
        const created = item.Created ? formatLocalDate(item.Created) : null;
        return created && created >= from && created <= to;
      });
    }

    // Filter by Renewal Month and Year (only if from/to are NOT both set)
    else if (RenewalMonth && RenewalYear) {
      filtered = allData.filter(item => {
        if (!item.RenewalDate) return false;
        const renewalDate = new Date(item.RenewalDate);
        const itemMonth = renewalDate.getMonth() + 1; // JS months are 0-based
        const itemYear = renewalDate.getFullYear();
        return itemMonth === Number(RenewalMonth) && itemYear === Number(RenewalYear);
      });
    } else {
      // Invalid state: only one of from/to or one of month/year provided
      filtered = [];
    }

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
      await sp.deleteData("IT", itemId, props);
      alert("Deleted");
      window.location.reload(); // optional: can be optimized to re-fetch
    }
  };

  const getFieldProps = (formik: FormikProps<any>, field: string) => ({
    ...formik.getFieldProps(field),
    errorMessage: formik.errors[field] as string
  });

  const initialValues = {
    Response: '',
    Enddate: '',
    Fromdate: '',
    Renewaldate: '',
    RenewalMonth: '',
    RenewalYear: '',
    ViewId: ''
  };

  const headers = [
    { label: "Plant Code", key: "PlantCodeId" },
    { label: "Project Name", key: "ProjectName" },
    { label: "Location", key: "Location" },
    { label: "PO Number", key: "PONumber" },
    { label: "OTC", key: "OTC" },
    { label: "Recurring", key: "Recurring" },
    { label: "PO Value", key: "POValue" },
    { label: "Total", key: "Total" },
    { label: "Actual", key: "Actual" },
    { label: "Category", key: "Category" },
    { label: "Sub-Category", key: "SubCategory" },
    { label: "Add Type", key: "AddType" },
    { label: "Billing Cycle", key: "BillingCycle" },
    { label: "Renewal Date", key: "RenewalDate" },
    { label: "Payment Month", key: "BillingMonth" },
    { label: "Year", key: "Year" },
    { label: "Budgeted", key: "Budgeted" },
    { label: "Site", key: "Site" },
    { label: "Quantity", key: "Quantity" },
    { label: "Cost per unit", key: "Costperunit" },
    { label: "Total", key: "Total2" }
  ];

  return (
    <Formik initialValues={initialValues} onSubmit={() => { }}>
      {(formik) => {
        useEffect(() => {
          if (formik.values.ViewId) {
            onChangeView({ target: { value: formik.values.ViewId } }, formik);
          }
        }, [formik.values.ViewId]);

        return (
          <div className="main">
            {/* Actions & Filters */}

            <div className='element-actions'>
              <span className={styles.btnnew} style={{ background: '#c4291c', borderColor: 'border-color' }}><Link to="/">Yearly Budgeted</Link></span>
            </div>
            <div className='element-actions'>
              <span className={styles.btnnew} style={{ background: '#c4291c', borderColor: 'border-color' }}><Link to="/budgeted">Site Budgeted</Link></span>
            </div>

            <div className={styles.innertabs}>
              <div className="p-3 bg-white shadow-sm border">
                <h3 className={`${styles.headingh1} elementheading`}>Initiator Dashboard</h3>

                <div className='row mr--1' style={{ display: 'flex', flexWrap: 'wrap', marginRight: '15px', gap: '0px' }}>
                  <div className='col-md-3'>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

                  <div className='col-md-3'>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="renewalMonth" className='col-form-label mb-0'>
                        Renewal Month
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Month Dropdown */}
                        <select
                          id="renewalMonth"
                          name="RenewalMonth"
                          className="form-control"
                          value={formik.values.RenewalMonth || ''}
                          onChange={(e) => formik.setFieldValue('RenewalMonth', e.target.value)}
                        >
                          <option value="">Month</option>
                          {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                          ].map((month, idx) => (
                            <option key={idx} value={idx + 1}>{month}</option>
                          ))}
                        </select>

                        {/* Year Dropdown */}
                        <select
                          id="renewalYear"
                          name="RenewalYear"
                          className="form-control"
                          value={formik.values.RenewalYear || ''}
                          onChange={(e) => formik.setFieldValue('RenewalYear', e.target.value)}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Validation messages */}
                    {(formik.errors.RenewalMonth || formik.errors.RenewalYear) && (
                      <div style={{ paddingTop: 4, color: "#B2484D", fontSize: ".75rem", fontFamily: "Segoe UI" }}>
                        {formik.errors.RenewalMonth || formik.errors.RenewalYear}
                      </div>
                    )}
                  </div>

                  <div className='col-md-2'>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '35px' }}>
                      <PrimaryButton
                        type='submit'
                        style={{ background: '#c4291c', width: '120px', height: '35px' }}
                        className={styles.btnprimary}
                        text='Search'
                        onClick={async () => { await onRequestInitiate(formik.values); }}
                        value={'Submitted'}
                        iconProps={{ iconName: 'Search' }}
                      />
                    </div>
                  </div>

                  <div className='col-md-3'>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '0 15px'
                    }}>
                      <label className='col-form-label'>Search</label>
                      <SearchBox
                        placeholder="Search records..."
                        className="search-input"
                        onSearch={newValue => onBlockRequestSearch(newValue)}
                        onClear={ev => onBlockRequestSearch('')}
                        onBlur={ev => onBlockRequestSearch(ev.target.value)}
                        styles={{
                          root: { width: '100%' },
                          field: {
                            fontSize: '14px',
                            padding: '8px 12px'
                          },
                          icon: {
                            color: '#666'
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className='col-md-3'>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '0 15px'
                    }}>
                      <label className='col-form-label'>Payment Month</label>
                      <select
                        id='ddlBillingMonth'
                        className='form-control'
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                        {...getFieldProps(formik, 'BillingMonthId')}
                        onChange={async (e) => {
                          formik.setFieldValue('BillingMonthId', e.target.value);
                          await onChangePaymentMonth(e, formik);
                        }}
                      >
                        <option value="">Select Payment Month</option>
                        {months !== undefined ? months.map((Vend) => (
                          <option key={Vend.Id} value={Vend.Id}>
                            {Vend.Month}
                          </option>
                        )) : ''}
                      </select>
                    </div>
                  </div>

                  <div className='col-md-3'>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '0 15px'
                    }}>
                      <label className='col-form-label'>Select View</label>
                      <select
                        id='ddlViewMonth'
                        className='form-control'
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                        {...getFieldProps(formik, 'ViewId')}
                        onChange={async (e) => {
                          formik.setFieldValue('ViewId', e.target.value);
                          await onChangeView(e, formik);
                        }}
                      >
                        <option value="Site Budgeted">Site Budgeted</option>
                        <option value="Yearly Budgeted">Yearly Budgeted</option>
                        {/* Add other options here */}
                      </select>
                    </div>
                  </div>

                  <div className='col-md-3'>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '0 15px'
                    }}>
                      <label className='col-form-label'>Plant Code</label>
                      <select
                        id='ddlPlantCode'
                        className='form-control'
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '14px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                        {...getFieldProps(formik, 'PlantCodeId')}
                        onChange={async (e) => {
                          formik.setFieldValue('PlantCodeId', e.target.value);
                          await onChangePlantCode(e, formik);
                        }}
                      >
                        <option value="">Select</option>
                        {plantCodes?.map((Vend) => (
                          <option key={Vend.Id} value={Vend.Id}>{Vend.PlantCode}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='col-md-6' style={{ marginLeft: '16px', paddingTop: '37px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '37.5 px' }}>
                      <PrimaryButton
                        type='submit'
                        style={{ background: '#c4291c', width: '120px', height: '35px' }}
                        className={styles.btnprimary}
                        text='All Data'
                        onClick={async (e) => {
                          await onRequestReset();
                          formik.setFieldValue('PlantCodeId', '');
                          formik.setFieldValue('Fromdate', '');
                          formik.setFieldValue('Enddate', '');
                          formik.setFieldValue('RenewalMonth', 'Month');
                          formik.setFieldValue('RenewalYear', 'Year');
                          formik.setFieldValue('BillingMonthId', '');
                          formik.setFieldValue('ViewId', 'Site Budgeted');
                        }}
                        value={'Submitted'}
                        iconProps={{ iconName: 'Reset' }}
                      />
                      {filteredData.length > 0 && (
                        <CSVLink
                          data={filteredData}
                          headers={headers}
                          filename="InitiatorLanding.csv"
                          style={{
                            textDecoration: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            backgroundColor: '#c4291c',
                            border: '1px solid #c4291c',
                            borderRadius: '3px',
                            padding: '8px',
                            width: '120px',
                            height: '35px'
                          }}
                        >
                          <Icon iconName="ExcelDocument" style={{ color: 'white' }} />
                          <span>Export</span>
                        </CSVLink>
                      )}
                    </div>
                  </div>
                </div>


                {/* Table Section */}
                <div style={{ overflowX: 'auto' }}>
                  {selectedView === 'Yearly Budgeted' && (
                    <table className={`${styles.tblrequest} ${styles.tablebordered}`}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'center' }}>Location</th>
                          <th style={{ textAlign: 'center' }}>Year</th>
                          <th style={{ textAlign: 'center' }}>Category</th>
                          <th style={{ textAlign: 'center' }}>Domain</th>
                          <th style={{ textAlign: 'center' }}>Sub-Category</th>
                          <th style={{ textAlign: 'center' }}>Type</th>
                          <th style={{ textAlign: 'center' }}>Billing Cycle</th>
                          <th style={{ textAlign: 'center' }}>Payment Month</th>
                          <th style={{ textAlign: 'center' }}>OTC</th>
                          <th style={{ textAlign: 'center' }}>Recurring</th>
                          <th style={{ textAlign: 'center' }}>Total</th>
                          <th style={{ textAlign: 'center' }}>Renewal Date</th>
                          <th style={{ textAlign: 'center' }}>Edit</th>
                          <th style={{ textAlign: 'center' }}>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPageData.map(row => (
                          <tr key={row.Id}>
                            <td >{row.Location}</td>
                            <td >{row.Year}</td>
                            <td >{row.Category}</td>
                            <td >{row.Domain}</td>
                            <td >{row.SubCategory}</td>
                            <td >{row.AddType}</td>
                            <td >{row.BillingCycle}</td>
                            <td >{row.BillingMonth}</td>
                            <td >{row.OTC}</td>
                            <td >{row.Recurring}</td>
                            <td >{row.Total}</td>
                            <td >{moment(row.RenewalDate).format("DD/MM/YYYY")}</td>
                            <td style={{ textAlign: 'center' }}><Link to={`/EditRequest/${row.Id}`}><Icon iconName="PageEdit" className={styles.icon} /></Link></td>
                            <td style={{ textAlign: 'center' }}><Icon iconName="Delete" className={styles.icon} onClick={() => handleDelete(row.Id)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>)}
                  {selectedView === 'Site Budgeted' && (
                    <table className={`${styles.tblrequest} ${styles.tablebordered}`}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'center' }}>Plant Code</th>
                          <th style={{ textAlign: 'center' }}>Project Name</th>
                          <th style={{ textAlign: 'center' }}>Category</th>
                          <th style={{ textAlign: 'center' }}>Domain</th>
                          <th style={{ textAlign: 'center' }}>Sub-Category</th>
                          <th style={{ textAlign: 'center' }}>Quantity</th>
                          <th style={{ textAlign: 'center' }}>Cost per Unit</th>
                          <th style={{ textAlign: 'center' }}>Total Price (Qty * Cost per Unit)</th>
                          <th style={{ textAlign: 'center' }}>OTC</th>
                          <th style={{ textAlign: 'center' }}>Procured Qty</th>
                          <th style={{ textAlign: 'center' }}>Balance Qty (Total Qty - Procured Qty)</th>
                          <th style={{ textAlign: 'center' }}>Total Cost (Total Price + OTC)</th>
                          <th style={{ textAlign: 'center' }}>Edit</th>
                          <th style={{ textAlign: 'center' }}>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPageData.map(row => (
                          <tr key={row.Id}>
                            <td>{row.PlantCodeId}</td>
                            <td>{row.ProjectName}</td>
                            <td >{row.Category}</td>
                            <td >{row.Domain}</td>
                            <td >{row.SubCategory}</td>
                            <td >{row.Quantity}</td>
                            <td >{row.Costperunit}</td>
                            <td >{row.Total2}</td>
                            <td >{row.OTC}</td>
                            <td >{row.ProcuredQty}</td>
                            <td >{row.BalanceQty}</td>
                            <td >{row.TotalCost}</td>
                            <td style={{ textAlign: 'center' }}><Link to={`/EditRequest/${row.Id}`}><Icon iconName="PageEdit" className={styles.icon} /></Link></td>
                            <td style={{ textAlign: 'center' }}><Icon iconName="Delete" className={styles.icon} onClick={() => handleDelete(row.Id)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
        );
      }}
    </Formik>
  );
};
