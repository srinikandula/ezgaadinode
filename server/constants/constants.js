const serviceActions={
    login_successful:'LG_IN',
    invalid_login:'INV_LGIN',
    invalid_login_params:'INV_LGIN_PRMS',
    invalid_fgt_pwd_params:'INV_FGT_PWD_PRMS',
    req_fgt_pwd:'FGT_PWD',
    invalid_user:'INV_USR',
    fgt_pwd_otp_err:'FGT_PWD_OTP_ERR',
    invalid_otp_params:'INV_OTP_PRMS',
    otp_expired:'OTP_EXPRD',
    verify_otp_err:'OTP_VERFY_ERR',
    verify_otp:'VERFY_OTP',
    invalid_otp:'INV_OTP',
    pwd_send_err:'PWD_SEND_ERR',
    reset_pwd:'RESET_PWD',
    reset_pwd_err:'RESER_PWD_ERR',
    add_driver:'ADD_DRIVER',
    add_driver_err:'ADD_DRIVER_ERR',
    get_driver_det:'GET_DRIVER_DET',
    get_driver_det_err:'GET_DRIVER_DET_ERR',
    update_driver:'UPDATE_DRIVER',
    update_driver_err:'UPDATE_DRIVER_ERR',
    get_drivers:'GET_DRIVERS',
    get_drivers_err:'GET_DRIVERS_ERR',
    delete_driver:'DELETE_DRIVER',
    delete_driver_err:'DELETE_DRIVER_ERR',
    count_driver:'COUNT_DRIVER',
    count_driver_err:'COUNT_DRIVER_ERR',
    get_drivers_for_filter:'GET_DRIVERS_FOR_FILTER',
    get_drivers_for_filter_err:'GET_DRIVERS_FOR_FILTER_ERR',
    get_event_data:'GET_EVENT_DATA',
    get_event_data_err:'GET_EVENT_DATA_ERR',
    get_latest_device_loc:'GET_LATEST_DEVICE_LOC',
    get_latest_device_loc_err:'GET_LATEST_DEVICE_LOC_ERR',
    get_srlogistics:'GET_SRLOGISTICS',
    get_srlogistics_err:'GET_SRLOGISTICS_ERR',
    get_lat_loc:'GET_SRLOGISTICS_LAT_LOC',
    get_lat_loc_err:'GET_SRLOGISTICS_LAT_LOC_ERR',
    get_srlgoistics_reload_data:'GET_SRLOGISTICS_RELOAD_DATA',
    delete_all:'DELETE_ALL',
    delete_all_err:'DELETE_ALL_ERR',
    cre_event_data:'CRE_EVENT_DATA',
    cre_event_data_err:'CRE_EVENT_DATA_ERR',
    get_grp_map_events:'GET_GRP_MAP_EVENTS',
    get_grp_map_events_err:'GET_GRP_MAP_EVENTS_ERR',
    track_events_by_veh:'TRACK_EVENTS_BY_VEH',
    track_events_by_veh_err:'TRACK_EVENTS_BY_VEH_ERR',
    get_account_data:'GET_ACC_DATA',
    get_account_data_err:'GET_ACC_DATA_ERR',
    get_account_grp_data:'GET_ACC_GRP_DATA',
    get_account_grp_data_err:'GET_ACC_GRP_DATA_ERR',
    add_expense_type:'ADD_EXPENSE_TYPE',
    add_expense_type_err:'ADD_EXPENSE_TYPE_ERR',
    get_all_acc_expenses:'GET_ALL_ACC_EXPENSES',
    get_all_acc_expenses_err:'GET_ALL_ACC_EXPENSES_ERR',
    get_expense_type:'GET_EXPENSE_TYPE',
    get_expense_type_err:'GET_EXPENSE_TYPE_ERR',
    update_expense_type:'UPDATE_EXPENSE_TYPE',
    update_expense_type_err:'UPDATE_EXPENSE_TYPE_ERR',
    delete_expense_type:'DELETE_EXPENSE_TYPE',
    delete_expense_type_err:'DELETE_EXPENSE_TYPE_ERR',
    count_expense_types:'COUNT_EXPENSE_TYPES',
    count_expense_types_err:'COUNT_EXPENSE_TYPES_ERR',
    add_expense:'ADD_EXPENSE',
    add_expense_err:'ADD_EXPENSE_ERR',
    get_all_expenses:'GET_ALL_EXPENSES',
    get_all_expenses_err:'GET_ALL_EXPENSES_ERR',
    find_expense_by_id:'FIND_EXPENSE_BY_ID',
    find_expense_by_id_err:'FIND_EXPENSE_BY_ID_ERR',
    update_expense:'UPDATE_EXPENSE',
    update_expense_err:'UPDATE_EXPENSE_ERR',
    del_expense:'DEL_EXPENSE',
    del_expense_err:'DEL_EXPENSE_ERR',
    count_expense:'COUNT_EXPENSE',
    count_expense_err:'COUNT_EXPENSE_ERR',
    find_total_expenses:'FIND_TOTAL_EXPENSES',
    find_total_expenses_err:'FIND_TOTAL_EXPENSES_ERR',
    find_expenses_by_vehs:'FIND_EXPENSES_BY_VEHS',
    find_expenses_by_vehs_err:'FIND_EXPENSES_BY_VEHS_ERR',
    find_expenses_by_veh:'FIND_EXPENSES_BY_VEH',
    find_expenses_by_veh_err:'FIND_EXPENSES_BY_VEH_ERR',
    share_expense_det_by_email:'SHARE_EXPENSE_DET_BY_EMAIL',
    share_expense_det_by_email_err:'SHARE_EXPENSE_DET_BY_EMAIL_ERR',
    dwnld_expense_det:'DWNLD_EXPENSE_DET',
    dwnld_expense_det_err:'DWNLD_EXPENSE_DET_ERR',
    dwnld_payable_det_by_party:'DWNLD_PAYABLE_DET_BY_PARTY',
    dwnld_payable_det_by_party_err:'DWNLD_PAYABLE_DET_BY_PARTY_ERR',
    get_payable_amnt_by_party:'GET_PAYABLE_AMNT_BY_PARTY',
    get_payable_amnt_by_party_err:'GET_PAYABLE_AMNT_BY_PARTY_ERR',
    share_payable_det_by_email:'SHARE_PAYABLE_DET_BY_EMAIL',
    share_payable_det_by_email_err:'SHARE_PAYABLE_DET_BY_EMAIL_ERR',
    get_payable_amnt_by_party_id:'GET_PAYABLE_AMNT_BY_PARTY_ID',
    get_payable_amnt_by_party_id_err:'GET_PAYABLE_AMNT_BY_PARTY_ID_ERR',
    add_party:'ADD_PARTY',
    add_party_err:'ADD_PARTY_ERR',
    get_parties_by_supp:'GET_SUPPLIES_BY_SUPP',
    get_parties_by_supp_err:'GET_SUPPLIES_BY_SUPP_ERR',
    get_parties_by_trans:'GET_PARTIES_BY_TRANS',
    get_parties_by_trans_err:'GET_PARTIES_BY_TRANS_ERR',
    find_party:'FIND_PARTY',
    find_party_err:'FIND_PARTY_ERR',
    update_party:'UPDATE_PARTY',
    update_party_err:'UPDATE_PARTY_ERR',
    get_account_parties:'GET_ACCOUNT_PARTIES',
    get_account_parties_err:'GET_ACCOUNT_PARTIES_ERR',
    get_all_parties:'GET_ALL_PARTIES',
    get_all_parties_err:'GET_ALL_PARTIES_ERR',
    del_party:'DEL_PARTY',
    del_party_err:'DEL_PARTY_ERR',
    count_party:'COUNT_PARTY',
    count_party_err:'COUNT_PARTY_ERR',
    find_trips_and_pymnts_for_parties:'FIND_TRIPS_AND_PYMNTS_FOR_PARTIES',
    find_trips_and_pymnts_for_parties_err:'FIND_TRIPS_AND_PYMNTS_FOR_PARTIES_ERR',
    find_trips_and_pymnts_for_veh:'FIND_TRIPS_AND_PYMNTS_FOR_VEH',
    find_trips_and_pymnts_for_veh_err:'FIND_TRIPS_AND_PYMNTS_FOR_VEH_ERR',
    get_all_parties_for_filter:'GET_ALL_PARTIES_FOR_FILTER',
    get_all_parties_for_filter_err:'GET_ALL_PARTIES_FOR_FILTER_ERR',
    add_payment:'ADD_PAYMENT',
    add_payment_err:'ADD_PAYMENT_ERR',
    get_all_acc_payments:'GET_ALL_ACC_PAYMENTS',
    get_all_acc_payments_err:'GET_ALL_ACC_PAYMENTS_ERR',
    update_payments:'UPDATE_PAYMENTS',
    update_payments_err:'UPDATE_PAYMENTS_ERR',
    find_payments_recieved:'FIND_PAYMENTS_RECIEVED',
    find_payments_recieved_err:'FIND_PAYMENTS_RECIEVED_ERR',
    del_payments_record:'DEL_PAYMENTS_RECORD',
    del_payments_record_err:'DEL_PAYMENTS_RECORD_ERR',
    count_payments:'COUNT_PAYMENTS',
    count_payments_err:'COUNT_PAYMENTS_ERR',
    get_payments:'GET_PAYMENTS',
    get_payments_err:'GET_PAYMENTS_ERR',
    get_total_amnt:'GET_TOTAL_AMNT',
    get_total_amnt_err:'GET_TOTAL_AMNT_ERR',
    get_account_due:'GET_ACCOUNT_DUE',
    get_account_due_err:'GET_ACCOUNT_DUE_ERR',
    get_dues_by_party:'GET_DUES_BY_PARTY',
    get_dues_by_party_err:'GET_DUES_BY_PARTY_ERR',
    share_party_payment_det_by_email:'SHARE_PARTY_PAYMENT_DET_BY_EMAIL',
    share_party_payment_det_by_email_err:'SHARE_PARTY_PAYMENT_DET_BY_EMAIL_ERR',
    dwnld_party_payment_det:'DWNLD_PARTY_PAYMENT_DET',
    dwnld_party_payment_det_err:'DWNLD_PARTY_PAYMENT_DET_ERR',
    add_role:'ADD_ROLE',
    add_role_err:'ADD_ROLE_ERR',
    get_roles:'GET_ROLES',
    get_roles_err:'GET_ROLES_ERR',
    get_all_roles:'GET_ALL_ROLES',
    get_all_roles_err:'GET_ALL_ROLES_ERR',
    get_role:'GET_ROLE',
    get_role_err:'GET_ROLE_ERR',
    update_role:'UPDATE_ROLE',
    update_role_err:'UPDATE_ROLE_ERR',
    delete_role:'DELETE_ROLE',
    delete_role_err:'DELETE_ROLE_ERR',
    add_trip:'ADD_TRIP',
    add_trip_err:'ADD_TRIP_ERR',
    account_trips:'ACCOUNT_TRIPS',
    account_trips_err:'ACCOUNT_TRIPS_ERR',
    all_trips:'ALL_TRIPS',
    all_trips_err:'ALL_TRIPS_ERR',
    update_trips:'UPDATE_TRIPS',
    update_trips_err:'UPDATE_TRIPS_ERR',
    revenue_det_by_veh_email:'REVENUE_DET_BY_VEH_EMAIL',
    revenue_det_by_veh_email_err:'REVENUE_DET_BY_VEH_EMAIL_ERR',
    revenue_det_by_veh_dwnld:'REVENUE_DET_BY_VEH_DWNLD',
    revenue_det_by_veh_dwnld_err:'REVENUE_DET_BY_VEH_DWNLD_ERR',
    find_trip:'FIND_TRIP',
    find_trip_err:'FIND_TRIP_ERR',
    delete_trip:'DELETE_TRIP',
    delete_trip_err:'DELETE_TRIP_ERR',
    get_report:'GET_REPORT',
    get_report_err:'GET_REPORT_ERR',
    find_total_revenue:'FIND_TOTAL_REVENUE',
    find_total_revenue_err:'FIND_TOTAL_REVENUE_ERR',
    find_total_revenue_by_party:'FIND_TOTAL_REVENUE_BY_PARTY',
    find_total_revenue_by_party_err:'FIND_TOTAL_REVENUE_BY_PARTY_ERR',
    find_revenue_by_veh:'FIND_REVENUE_BY_VEHICLE',
    find_revenue_by_veh_err:'FIND_REVENUE_BY_VEHICLE_ERR',
    find_trips_by_party:'FIND_TRIPS_BY_PARTY',
    find_trips_by_party_err:'FIND_TRIPS_BY_PARTY_ERR',
    find_trips_by_veh:'FIND_TRIPS_BY_VEH',
    find_trips_by_veh_err:'FIND_TRIPS_BY_VEH_ERR',
    trips_send_email:'TRIPS_SEND_EMAIL',
    trips_send_email_err:'TRIPS_SEND_EMAIL_ERR',
    count_trips:'COUNT_TRIPS',
    count_trips_err:'COUNT_TRIPS_ERR',
    get_parties_by_trips:'GET_PARTIES_BY_TRIPS',
    get_parties_by_trips_err:'GET_PARTIES_BY_TRIPS_ERR',
    looking_for_trip_req:'LOOKING_FOR_TRIP_REQ',
    looking_for_trip_req_err:'LOOKING_FOR_TRIP_REQ_ERR',
    add_tru_err:'ADD_TRU_ERR',
    add_tru:'ADD_TRU',
    fin_tru:'FIND_TRU',
    fin_tru_err:'FIN_TRU_ERR',
    exprd_tru_det_email:'EXPRD_TRU_DET_EMAIL',
    exprd_tru_det_email_err:'EXPRD_TRU_DET_EMAIL_ERR',
    exprd_tru_det_dwnld:'EXPRD_TRU_DET_DWNLD',
    exprd_tru_det_dwnld_err:'EXPRD_TRU_DET_DWNLD_ERR',
    retrieve_trus:'RETRIEVE_TRUS',
    retrieve_trus_err:'RETRIEVE_TRUS_ERR',
    find_exprd_trus:'FIND_EXPRD_TRUS',
    find_exprd_trus_err:'FIND_EXPRD_TRUS_ERR',
    find_exprd_trus_count:'FIND_EXPRD_TRUS_COUNT',
    fitness_expry_trus:'FITNESS_EXPRY_TRUS',
    fitness_expry_trus_err:'FITNESS_EXPRY_TRUS_ERR',
    permit_expry_trus:'PERMIT_EXPRY_TRUS',
    permit_expry_trus_err:'PERMIT_EXPRY_TRUS_ERR',
    insurance_expry_trus:'INSURANCE_EXPRY_TRUS',
    insurance_expry_trus_err:'INSURANCE_EXPRY_TRUS_ERR',
    pollution_expry_trus:'POLLUTION_EXPRY_TRUS',
    pollution_expry_trus_err:'POLLUTION_EXPRY_TRUS_ERR',
    tax_expry_trus:'TAX_EXPRY_TRUS',
    tax_expry_trus_err:'TAX_EXPRY_TRUS_ERR',
    trus_count:'TRUS_COUNT',
    trus_count_err:'TRUS_COUNT_ERR',
    update_tru:'UPDATE_TRU',
    update_tru_err:'UPDATE_TRU_ERR',
    del_tru:'DEL_TRU',
    del_tru_err:'DEL_TRU_ERR',
    all_trus:'ALL_TRUS',
    all_trus_err:'ALL_TRUS_ERR',
    unnassigned_trus:'UNASSIGNED_TRUS',
    unnassigned_trus_err:'UNASSIGNED_TRUS_ERR',
    assign_trus:'ASSIGN_TRUS',
    assign_trus_err:'ASSIGN_TRUS_ERR',
    unassign_trus:'UNASSIGN_TRUS',
    unassign_trus_err:'UNASSIGN_TRUS_ERR',
    get_all_trus_for_filter:'GET_ALL_TRUS_FOR_FILTER',
    get_all_trus_for_filter_err:'GET_ALL_TRUS_FOR_FILTER_ERR',
    add_customer_lead:'ADD_CUSTOMER_LEAD',
    add_customer_lead_err:'ADD_CUSTOMER_LEAD_ERR',
    get_customer_leads:"GET_CUSTOMER_LEADS",
    get_customer_leads_err:"GET_CUSTOMER_LEADS_ERR",
    update_customer_lead:"UPDATE_CUSTOMER_LEAD",
    update_customer_lead_err:"UPDATE_CUSTOMER_LEAD_ERR",
    delete_customer_lead:"DELETE_CUSTOMER_LEAD",
    delete_customer_lead_err:"DELETE_CUSTOMER_LEAD_ERR",
    get_customer_lead_details:"GET_CUSTOMER_LEAD_DETAILS",
    get_customer_lead_details_err:"GET_CUSTOMER_LEAD_DETAILS_ERR"


};
module.exports=serviceActions;