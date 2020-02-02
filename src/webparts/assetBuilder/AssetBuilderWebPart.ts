import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneLabel,
} from '@microsoft/sp-webpart-base';

import * as strings from 'AssetBuilderWebPartStrings';
import AssetBuilder from './components/AssetBuilder';
import { IAssetBuilderProps } from './components/IAssetBuilderProps';

//  >>>> ADD import additional controls/components
import { sp, } from "@pnp/sp";
import { UrlFieldFormatType, Field } from "@pnp/sp/presets/all";
import { IFieldAddResult, FieldTypes,
    ChoiceFieldFormatType,
    DateTimeFieldFormatType, CalendarType, DateTimeFieldFriendlyFormatType,
    FieldUserSelectionMode } from "@pnp/sp/fields/types";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/views";

export interface IAssetBuilderWebPartProps {
  description: string;
  localListName: string;
  localListConfirmed: boolean;
}

const LOG_SOURCE: string = 'RedirectApplicationCustomizer';



export default class AssetBuilderWebPart extends BaseClientSideWebPart<IAssetBuilderWebPartProps> {

  @override
  public async onInit(): Promise<void> {

    // initialize PnP JS library to play with SPFx contenxt
    sp.setup({
      spfxContext: this.context
    });

    // read the server relative URL of the current page from Legacy Page Context
    const currentPageRelativeUrl: string = this.context.pageContext.legacyPageContext.serverRequestPath;
/*
    if (await this.ensureSocialiis7List()) {
      alert('Done Ensuring!');
    }
*/

  }

  // this method ensures that the Redirections lists exists, or if it doesn't exist
  // it creates it, as long as the currently connected user has proper permissions
  private async ensureSocialiis7List(myListName: string, myListDesc: string): Promise<boolean> {
    
    let result: boolean = false;

    try {
      const ensureResult = await sp.web.lists.ensure(myListName,
        myListDesc,
        100,
        true);

      // if we've got the list
      if (ensureResult.list != null) {
        // if the list has just been created
        if (ensureResult.created) {
          // we need to add the custom fields to the list
          //https://pnp.github.io/pnpjs/sp/lists/#ensure-that-a-list-exists-by-title
          //https://pnp.github.io/pnpjs/sp/fields/

          //Add this after creating field to change title:  //await field1.field.update({ Title: "My Text"});

          let columnGroup = 'Socialiis';
          let fieldSchema = '<Field Type="Text" DisplayName="profilePic" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE" MaxLength="255" ID="{571ed868-4226-472b-bc34-d783b00d8931}" SourceID="{60fda9ed-9447-4d2f-91fb-2d6b7eadd064}" StaticName="profilePic" Name="profilePic" ColName="nvarchar5" RowOrdinal="0" CustomFormatter="" Version="1"><Default>myDefaultValue</Default></Field>';
          const fieldXX: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);


          const field2: IFieldAddResult = await ensureResult.list.fields.addText("keywords", 255, { Group: columnGroup });
          const field3: IFieldAddResult = await ensureResult.list.fields.addText("profilePic", 255, { Group: columnGroup });
          const field4: IFieldAddResult = await ensureResult.list.fields.addNumber("order", 0, 99, { Group: columnGroup, DefaultFormula: "99" });
          const field5: IFieldAddResult = await ensureResult.list.fields.addText("NavTitle", 255, { Group: columnGroup });

          const choices = ['blog','facebook','feed','github','home','instagram','linkedIn','location','office365-SPList','office365-SPPage','office365-SPSite','office365-team','office365-user','office365-YammerGroup','office365-YammerUser','office365-YammerSearch','stackExchange','stock','twitter','website','wikipedia','youtube-user','youtube-playlist','youtube-channel','youtube-video'];
          const field6: IFieldAddResult = await ensureResult.list.fields.addChoice("mediaObject", choices, ChoiceFieldFormatType.Dropdown, false, { Group: columnGroup });

          const field7: IFieldAddResult = await ensureResult.list.fields.addText("objectID", 255, { Group: columnGroup });
          const field8: IFieldAddResult = await ensureResult.list.fields.addText("url", 255, { Group: columnGroup });
          const field20 = await ensureResult.list.fields.addCalculated("mediaSource", 
          '=IF(ISNUMBER(FIND("-",mediaObject)),TRIM(LEFT(mediaObject,FIND("-",mediaObject)-1)),TRIM(mediaObject))', 
          DateTimeFieldFormatType.DateTime, FieldTypes.Text, { Group: columnGroup });

          const field21 = await ensureResult.list.fields.addCalculated("objectType", 
          '=IF(ISNUMBER(FIND("-",mediaObject)),TRIM(MID(mediaObject,FIND("-",mediaObject)+1,100)),"")', 
          DateTimeFieldFormatType.DateTime, FieldTypes.Text, { Group: columnGroup });

          let viewXml = '<View Name="{77880F39-3182-4CFF-8750-FA9817046AC5}" DefaultView="TRUE" MobileView="TRUE" MobileDefaultView="TRUE" Type="HTML" DisplayName="All Items" Url="/sites/Templates/Socialiis/Lists/EntityList/AllItems.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><ViewFields><FieldRef Name="LinkTitle" /><FieldRef Name="keywords" /><FieldRef Name="profilePic" /><FieldRef Name="order0" /><FieldRef Name="NavTitle" /><FieldRef Name="mediaObject" /><FieldRef Name="objectID" /><FieldRef Name="url" /></ViewFields><ViewData /><Query><OrderBy><FieldRef Name="Title" /><FieldRef Name="order0" /></OrderBy></Query><Aggregations Value="Off" /><RowLimit Paged="TRUE">30</RowLimit><Mobile MobileItemLimit="3" MobileSimpleViewField="LinkTitle" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><Toolbar Type="Standard" /><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
          await ensureResult.list.views.getByTitle('All Items').setViewXml(viewXml);

          const resultVx = await ensureResult.list.views.add("My New View");
          viewXml = '<View Name="{B76BE63F-388D-402C-8B73-5405C5AFE019}" Type="HTML" DisplayName="Check Media Object" Url="/sites/Templates/Socialiis/Lists/EntityList/Check Media Object.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><ViewFields><FieldRef Name="LinkTitle" /><FieldRef Name="keywords" /><FieldRef Name="profilePic" /><FieldRef Name="mediaObject" /><FieldRef Name="mediaSource" /><FieldRef Name="objectType" /></ViewFields><ViewData /><Query><OrderBy><FieldRef Name="Title" /><FieldRef Name="order0" /></OrderBy></Query><Aggregations Value="Off" /><RowLimit Paged="TRUE">30</RowLimit><Mobile MobileItemLimit="3" MobileSimpleViewField="LinkTitle" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><Toolbar Type="Standard" /><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
          await resultVx.view.setViewXml(viewXml);

          // the list is ready to be used
          result = true;
          alert(`Hey there!  Your ${myListName} list is all ready to go!`);
        } else {
          // the list already exists, double check the fields objectID
          try {
            const field2 = await ensureResult.list.fields.getByInternalNameOrTitle("keywords").get();
            const field3 = await ensureResult.list.fields.getByInternalNameOrTitle("profilePic").get();
            const field4 = await ensureResult.list.fields.getByInternalNameOrTitle("order").get();
            const field5 = await ensureResult.list.fields.getByInternalNameOrTitle("NavTitle").get();
            const field6 = await ensureResult.list.fields.getByInternalNameOrTitle("mediaSource").get();
            const field7 = await ensureResult.list.fields.getByInternalNameOrTitle("objectID").get();
            const field8 = await ensureResult.list.fields.getByInternalNameOrTitle("url").get();
            //const field9 = await ensureResult.list.fields.getByInternalNameOrTitle("PnPRedirectionEnabled").get();
            //const field10 = await ensureResult.list.fields.getByInternalNameOrTitle("PnPRedirectionEnabled").get();
            //const field11 = await ensureResult.list.fields.getByInternalNameOrTitle("PnPRedirectionEnabled").get();
            const field20 = await ensureResult.list.fields.getByInternalNameOrTitle("mediaSource").get();
            const field21 = await ensureResult.list.fields.getByInternalNameOrTitle("objectType").get();

            // if it is all good, then the list is ready to be used
            result = true;
            console.log(`Your ${myListName} list is already set up!`);
            alert(`Your ${myListName} list is already set up!`);
          } catch (e) {
            // if any of the fields does not exist, raise an exception in the console log
            let errMessage = this.getHelpfullError(e);
            console.log(`The ${myListName} list had this error:`, errMessage);

          }
        }
      }
    } catch (e) {
      // if we fail to create the list, raise an exception in the console log
      console.log(`Failed to create custom list ${myListName}.`, e, e.error);
    }

    return(result);
  }

  private async ensureTrackTimeList(myListName: string, myListDesc: string, ProjectOrTime: string): Promise<boolean> {
    
    let result: boolean = false;

    let isProject = ProjectOrTime.toLowerCase() === 'project' ? true : false;
    let isTime = ProjectOrTime.toLowerCase() === 'trackmytime' ? true : false;

    try {
      const ensureResult = await sp.web.lists.ensure(myListName,
        myListDesc,
        100,
        true);

      // if we've got the list
      if (ensureResult.list != null) {
        // if the list has just been created
        if (ensureResult.created) {
          // we need to add the custom fields to the list
          //https://pnp.github.io/pnpjs/sp/lists/#ensure-that-a-list-exists-by-title
          //https://pnp.github.io/pnpjs/sp/fields/

          //Add this after creating field to change title:  //await field1.field.update({ Title: "My Text"});

          let columnGroup = 'TrackTimeProject';


          let fieldSchema = '<Field DisplayName="Active" Format="Dropdown" Name="Active" Title="Active" Type="Boolean" ID="{d738a4f4-b23d-409d-a72e-8a09a6cd78a8}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="Active" ColName="bit1" RowOrdinal="0"><Default>1</Default></Field>';
          const active: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field Type="Number" DisplayName="SortOrder" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE" Min="1" Max="24" Decimals="1" ID="{a65f6333-dd5d-49af-acf9-68f1606052f2}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="SortOrder" Name="SortOrder" ColName="float1" RowOrdinal="0" />';
          if (isProject) { const sortOrder: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema); }

          fieldSchema = '<Field Type="Boolean" DisplayName="Everyone" EnforceUniqueValues="FALSE" Indexed="FALSE" ID="{67fa37c2-2ccf-4c30-b586-ce876955cb12}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="Everyone" Name="Everyone" ColName="bit2" RowOrdinal="0"><Default>0</Default></Field>';
          if (isProject) { const everyone: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema); } 

          fieldSchema = '<Field DisplayName="Leader" Format="Dropdown" List="UserInfo" Name="Leader" Title="Leader" Type="User" UserSelectionMode="1" UserSelectionScope="0" ID="{10e58bd6-3722-47a9-a34c-87c2dcade2aa}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="Leader" ColName="int1" RowOrdinal="0" />';
          const leader: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field DisplayName="Team" Format="Dropdown" List="UserInfo" Mult="TRUE" Name="Team" Title="Team" Type="UserMulti" UserSelectionMode="0" UserSelectionScope="0" ID="{1614eec8-246a-4d63-9ce9-eb8c8a733af1}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="Team" ColName="int2" RowOrdinal="0" />';
          const team: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field ClientSideComponentId="00000000-0000-0000-0000-000000000000" DisplayName="Category1" FillInChoice="TRUE" Format="Dropdown" Name="Category1" Required="TRUE" Title="Category1" Type="MultiChoice" ID="{b04db900-ab45-415d-bb11-336704f82d31}" Version="4" StaticName="Category1" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" ColName="ntext3" RowOrdinal="0" CustomFormatter="" EnforceUniqueValues="FALSE" Indexed="FALSE"><CHOICES><CHOICE>Daily</CHOICE><CHOICE>SPFx</CHOICE><CHOICE>Assistance</CHOICE><CHOICE>Team Meetings</CHOICE><CHOICE>Training</CHOICE><CHOICE>------</CHOICE><CHOICE>Other</CHOICE></CHOICES></Field>';
          const category1: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field ClientSideComponentId="00000000-0000-0000-0000-000000000000" DisplayName="Category2" FillInChoice="TRUE" Format="Dropdown" Name="Category2" Title="Category2" Type="MultiChoice" ID="{ee040745-8628-479a-b865-98e35c9b6617}" Version="3" StaticName="Category2" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" ColName="ntext2" RowOrdinal="0" CustomFormatter="" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE"><CHOICES><CHOICE>EU</CHOICE><CHOICE>NA</CHOICE><CHOICE>SA</CHOICE><CHOICE>Asia</CHOICE></CHOICES></Field>';
          const category2: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field Type="Text" DisplayName="ProjectID1" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE" MaxLength="255" ID="{f844fefd-8fde-4227-9707-5facc835c7ed}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="ProjectID1" Name="ProjectID1" ColName="nvarchar4" RowOrdinal="0" />';
          const projectID1: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field Type="Text" DisplayName="ProjectID2" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE" MaxLength="255" ID="{432aeccc-6f3a-4bf0-b451-6970c0eb292d}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="ProjectID2" Name="ProjectID2" ColName="nvarchar5" RowOrdinal="0" />';
          const projectID2: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema);

          fieldSchema = '<Field Type="Text" DisplayName="TimeTarget" Required="FALSE" EnforceUniqueValues="FALSE" Indexed="FALSE" MaxLength="255" ID="{02c5c9a7-7690-4efe-8e75-404a90654946}" SourceID="{53db1cec-2e4f-4db9-b4be-8abbbae91ee7}" StaticName="TimeTarget" Name="TimeTarget" ColName="nvarchar6" RowOrdinal="0" />';
          if (isProject) { const timeTarget: IFieldAddResult = await ensureResult.list.fields.createFieldAsXml(fieldSchema); }

          const ccList: IFieldAddResult = await ensureResult.list.fields.addUrl("CCList", UrlFieldFormatType.Hyperlink, { Group: columnGroup });

          const ccEmail: IFieldAddResult = await ensureResult.list.fields.addText("CCEmail", 255, { Group: columnGroup });

          if (isTime) { //Fields specific for Time
            let minInfinity: number = -1.7976931348623157e+308;
            let maxInfinity = -1 * minInfinity ;
            const activity: IFieldAddResult = await ensureResult.list.fields.addUrl("Activity", UrlFieldFormatType.Hyperlink, { Group: columnGroup });
            const deltaT: IFieldAddResult = await ensureResult.list.fields.addNumber("DeltaT", minInfinity, maxInfinity, { Group: columnGroup });
            const comments: IFieldAddResult = await ensureResult.list.fields.addText("Comments", 255, { Group: columnGroup });

            const endTime: IFieldAddResult = await ensureResult.list.fields.addDateTime("EndTime", DateTimeFieldFormatType.DateTime, CalendarType.Gregorian, DateTimeFieldFriendlyFormatType.Disabled, { Group: columnGroup, Required: true });
            const startTime: IFieldAddResult = await ensureResult.list.fields.addDateTime("StartTime", DateTimeFieldFormatType.DateTime, CalendarType.Gregorian, DateTimeFieldFriendlyFormatType.Disabled, { Group: columnGroup, Required: true });
            const sourceProject: IFieldAddResult = await ensureResult.list.fields.addUrl("SourceProject", UrlFieldFormatType.Hyperlink, { Group: columnGroup });

            const user: IFieldAddResult = await ensureResult.list.fields.addUser("User", FieldUserSelectionMode.PeopleOnly, { Group: "My Group" });
            const settings: IFieldAddResult = await ensureResult.list.fields.addText("Settings", 255, { Group: columnGroup });
            const location: IFieldAddResult = await ensureResult.list.fields.addText("Location", 255, { Group: columnGroup });
            const entryType: IFieldAddResult = await ensureResult.list.fields.addText("EntryType", 255, { Group: columnGroup });

            const days: IFieldAddResult = await ensureResult.list.fields.addCalculated("Days", '=IFERROR((EndTime-StartTime),"")', DateTimeFieldFormatType.DateOnly, FieldTypes.Number, { Group: columnGroup });

            // let hoursWithFormatSchema = '<Field Type="Calculated" DisplayName="Hours" EnforceUniqueValues="FALSE" Indexed="FALSE" Format="DateOnly" Decimals="1" LCID="1033" ResultType="Number" ReadOnly="TRUE" ID="{3aba8d94-68e5-4368-a322-1e513c660506}" SourceID="{148e3b00-e7d3-4c93-b584-6c0dd2f74015}" StaticName="Hours" Name="Hours" ColName="sql_variant2" RowOrdinal="0" CustomFormatter="{"elmType":"div","children":[{"elmType":"span","txtContent":"@currentField","style":{"position":"absolute","white-space":"nowrap","padding":"0 4px"}},{"elmType":"div","attributes":{"class":{"operator":"?","operands":[{"operator":"&&","operands":[{"operator":"<","operands":[-8304,0]},{"operator":">","operands":[549,0]},{"operator":">=","operands":["@currentField",0]}]},"sp-field-dashedBorderRight",""]}},"style":{"min-height":"inherit","box-sizing":"border-box","padding-left":{"operator":"?","operands":[{"operator":">","operands":[0,-8304]},{"operator":"+","operands":[{"operator":"*","operands":[{"operator":"/","operands":[{"operator":"-","operands":[{"operator":"abs","operands":[-8304]},{"operator":"?","operands":[{"operator":"<","operands":["@currentField",0]},{"operator":"abs","operands":[{"operator":"?","operands":[{"operator":"<=","operands":["@currentField",-8304]},-8304,"@currentField"]}]},0]}]},8853]},100]},"%"]},0]}}},{"elmType":"div","attributes":{"class":{"operator":"?","operands":[{"operator":"&&","operands":[{"operator":"<","operands":[-8304,0]},{"operator":"<","operands":["@currentField",0]}]},"sp-css-backgroundColor-errorBackground sp-css-borderTop-errorBorder","sp-css-backgroundColor-blueBackground07 sp-css-borderTop-blueBorder"]}},"style":{"min-height":"inherit","box-sizing":"border-box","width":{"operator":"?","operands":[{"operator":">","operands":[0,-8304]},{"operator":"+","operands":[{"operator":"*","operands":[{"operator":"/","operands":[{"operator":"?","operands":[{"operator":"<=","operands":["@currentField",-8304]},{"operator":"abs","operands":[-8304]},{"operator":"?","operands":[{"operator":">=","operands":["@currentField",549]},549,{"operator":"abs","operands":["@currentField"]}]}]},8853]},100]},"%"]},{"operator":"?","operands":[{"operator":">=","operands":["@currentField",549]},"100%",{"operator":"?","operands":[{"operator":"<=","operands":["@currentField",-8304]},"0%",{"operator":"+","operands":[{"operator":"*","operands":[{"operator":"/","operands":[{"operator":"-","operands":["@currentField",-8304]},8853]},100]},"%"]}]}]}]}}},{"elmType":"div","style":{"min-height":"inherit","box-sizing":"border-box"},"attributes":{"class":{"operator":"?","operands":[{"operator":"&&","operands":[{"operator":"<","operands":[-8304,0]},{"operator":">","operands":[549,0]},{"operator":"<","operands":["@currentField",0]}]},"sp-field-dashedBorderRight",""]}}}],"templateId":"DatabarNumber"}" Version="1"><Formula>=IFERROR(24*(EndTime-StartTime),"")</Formula><FieldRefs><FieldRef Name="StartTime" /><FieldRef Name="EndTime" /></FieldRefs></Field>';

            const hours: IFieldAddResult = await ensureResult.list.fields.addCalculated("Hours", '=IFERROR(24*(EndTime-StartTime),"")', DateTimeFieldFormatType.DateOnly, FieldTypes.Number, { Group: columnGroup });
            const minutes: IFieldAddResult = await ensureResult.list.fields.addCalculated("Minutes", '=IFERROR(24*60*(EndTime-StartTime),"")', DateTimeFieldFormatType.DateOnly, FieldTypes.Number, { Group: columnGroup });



          }


          let viewXml = '';
          if (isTime) { //View schema specific for Time
            viewXml = '<View Name="{C7E59C90-7F68-4A19-96C8-73BB66C1A7A8}" DefaultView="TRUE" MobileView="TRUE" MobileDefaultView="TRUE" Type="HTML" DisplayName="All Items" Url="/sites/Templates/Tmt/Lists/TrackMyTime/AllItems.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><Query><OrderBy><FieldRef Name="ID" Ascending="FALSE" /></OrderBy></Query><ViewFields><FieldRef Name="ID" /><FieldRef Name="LinkTitle" /><FieldRef Name="Active" /><FieldRef Name="Leader" /><FieldRef Name="Team" /><FieldRef Name="Category1" /><FieldRef Name="Category2" /><FieldRef Name="User" /><FieldRef Name="StartTime" /><FieldRef Name="EndTime" /><FieldRef Name="Hours" /><FieldRef Name="Minutes" /><FieldRef Name="Days" /><FieldRef Name="Location" /><FieldRef Name="ProjectID1" /><FieldRef Name="ProjectID2" /><FieldRef Name="EntryType" /><FieldRef Name="DeltaT" /><FieldRef Name="Activity" /><FieldRef Name="Comments" /><FieldRef Name="CCList" /><FieldRef Name="CCEmail" /></ViewFields><CustomFormatter /><Toolbar Type="Standard" /><Aggregations Value="Off" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><RowLimit Paged="TRUE">30</RowLimit><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
          } else {
            viewXml = '<View Name="{B02AD2F6-34B3-4AF9-BA56-4B29BF28C49E}" DefaultView="TRUE" MobileView="TRUE" MobileDefaultView="TRUE" Type="HTML" DisplayName="All Items" Url="/sites/Templates/Tmt/Lists/Projects/AllItems.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><ViewFields><FieldRef Name="ID" /><FieldRef Name="Active" /><FieldRef Name="SortOrder" /><FieldRef Name="LinkTitle" /><FieldRef Name="Everyone" /><FieldRef Name="Leader" /><FieldRef Name="Team" /><FieldRef Name="Category1" /><FieldRef Name="Category2" /><FieldRef Name="ProjectID1" /><FieldRef Name="ProjectID2" /><FieldRef Name="TimeTarget" /><FieldRef Name="CCList" /><FieldRef Name="CCEmail" /></ViewFields><ViewData /><Query><OrderBy><FieldRef Name="SortOrder" /></OrderBy></Query><Aggregations Value="Off" /><RowLimit Paged="TRUE">30</RowLimit><Mobile MobileItemLimit="3" MobileSimpleViewField="Active" /><CustomFormatter /><Toolbar Type="Standard" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
          }

          await ensureResult.list.views.getByTitle('All Items').setViewXml(viewXml);

          if (isTime) { //Add more views for this list
            const V1 = await ensureResult.list.views.add("ActivityURLTesting");
            viewXml = '<View Name="{E76C719C-F90D-4F81-9306-5F83E2FB4AB4}" Type="HTML" DisplayName="ActivityURLTesting" Url="/sites/Templates/Tmt/Lists/TrackMyTime/ActivityURLTesting.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><ViewFields><FieldRef Name="ID" /><FieldRef Name="LinkTitle" /><FieldRef Name="Category1" /><FieldRef Name="Category2" /><FieldRef Name="ProjectID1" /><FieldRef Name="ProjectID2" /><FieldRef Name="Activity" /><FieldRef Name="Comments" /><FieldRef Name="User" /><FieldRef Name="StartTime" /><FieldRef Name="EndTime" /></ViewFields><ViewData /><Query><OrderBy><FieldRef Name="ID" Ascending="FALSE" /></OrderBy></Query><Aggregations Value="Off" /><RowLimit Paged="TRUE">30</RowLimit><Mobile MobileItemLimit="3" MobileSimpleViewField="ID" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><Toolbar Type="Standard" /><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
            await V1.view.setViewXml(viewXml);

            const V2 = await ensureResult.list.views.add("Commit Notes");
            viewXml = '<View Name="{6E564C83-0528-4B17-89EF-59E6148A19E2}" Type="HTML" DisplayName="Commit Notes" Url="/sites/Templates/Tmt/Lists/TrackMyTime/Commit Notes.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><ViewFields><FieldRef Name="ID" /><FieldRef Name="LinkTitle" /><FieldRef Name="StartTime" /><FieldRef Name="EndTime" /><FieldRef Name="ProjectID1" /><FieldRef Name="ProjectID2" /><FieldRef Name="Comments" /></ViewFields><ViewData /><Query><OrderBy><FieldRef Name="ID" Ascending="FALSE" /></OrderBy></Query><Aggregations Value="Off" /><RowLimit Paged="TRUE">30</RowLimit><Mobile MobileItemLimit="3" MobileSimpleViewField="ID" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><Toolbar Type="Standard" /><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
            await V2.view.setViewXml(viewXml);

            const V3 = await ensureResult.list.views.add("Recent Updates");
            viewXml = '<View Name="{F29474A6-6948-4176-8E5B-4B31C47E027F}" Type="HTML" DisplayName="Recent Updates" Url="/sites/Templates/Tmt/Lists/TrackMyTime/Recent Updates.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><Query><OrderBy><FieldRef Name="Created" Ascending="FALSE" /></OrderBy></Query><ViewFields><FieldRef Name="ID" /><FieldRef Name="Created" /><FieldRef Name="Author" /><FieldRef Name="LinkTitle" /><FieldRef Name="Comments" /><FieldRef Name="Category1" /><FieldRef Name="Category2" /><FieldRef Name="User" /><FieldRef Name="StartTime" /><FieldRef Name="EndTime" /><FieldRef Name="Location" /><FieldRef Name="EntryType" /><FieldRef Name="DeltaT" /><FieldRef Name="Activity" /></ViewFields><Toolbar Type="Standard" /><Aggregations Value="Off" /><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><RowLimit Paged="TRUE">30</RowLimit><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
            await V3.view.setViewXml(viewXml);

            const V4 = await ensureResult.list.views.add("TrackTime");
            viewXml = '<View Name="{9AD04F4B-8160-4FDD-8632-56DB0F4B8397}" Type="HTML" DisplayName="TrackTime" Url="/sites/Templates/Tmt/Lists/TrackMyTime/TrackTime.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/generic.png?rev=47"><ViewFields><FieldRef Name="User" /><FieldRef Name="LinkTitle" /><FieldRef Name="Category1" /><FieldRef Name="Category2" /><FieldRef Name="StartTime" /><FieldRef Name="EndTime" /></ViewFields><Query /><RowLimit Paged="TRUE">30</RowLimit><XslLink Default="TRUE">main.xsl</XslLink><JSLink>clienttemplates.js</JSLink><Toolbar Type="Standard" /><ParameterBindings><ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /><ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /></ParameterBindings></View>';
            await V4.view.setViewXml(viewXml);

            /*
            const V3 = await ensureResult.list.views.add("ActivityURLTesting");
            viewXml = '';
            await V3.view.setViewXml(viewXml);
            */
          }

          /*
          const resultVx = await ensureResult.list.views.add("");
          viewXml = '';
          await resultVx.view.setViewXml(viewXml);
          */

          // the list is ready to be used
          result = true;
          alert(`Hey there!  Your ${myListName} list is all ready to go!`);
        } else {
          // the list already exists, double check the fields objectID
          try {
            const field2 = await ensureResult.list.fields.getByInternalNameOrTitle("Active").get();
            if (isProject) { const field3 = await ensureResult.list.fields.getByInternalNameOrTitle("SortOrder").get(); }
            if (isProject) { const field4 = await ensureResult.list.fields.getByInternalNameOrTitle("Everyone").get(); }
            const field5 = await ensureResult.list.fields.getByInternalNameOrTitle("Leader").get();
            const field6 = await ensureResult.list.fields.getByInternalNameOrTitle("Team").get();
            const field7 = await ensureResult.list.fields.getByInternalNameOrTitle("Category1").get();
            const field8 = await ensureResult.list.fields.getByInternalNameOrTitle("Category2").get();
            const field20 = await ensureResult.list.fields.getByInternalNameOrTitle("ProjectID1").get();
            const field21 = await ensureResult.list.fields.getByInternalNameOrTitle("ProjectID2").get();
            if (isProject) { const field22 = await ensureResult.list.fields.getByInternalNameOrTitle("TimeTarget").get(); }
            const field23 = await ensureResult.list.fields.getByInternalNameOrTitle("CCList").get();
            const field24 = await ensureResult.list.fields.getByInternalNameOrTitle("CCEmail").get();
            // if it is all good, then the list is ready to be used
            result = true;
            console.log(`Your ${myListName} list is already set up!`);
            alert(`Your ${myListName} list is already set up!`);
          } catch (e) {
            // if any of the fields does not exist, raise an exception in the console log
            let errMessage = this.getHelpfullError(e);
            console.log(`The ${myListName} list had this error:`, errMessage);

          }
        }
      }
    } catch (e) {
      // if we fail to create the list, raise an exception in the console log
      console.log(`Failed to create custom list ${myListName}.`, e, e.error);
    }

    return(result);
  }



  public getHelpfullError(e){
    let result = 'e';
    let errObj: {} = null;
      if (e.message) {
        let loc1 = e.message.indexOf("{\"");
        if (loc1 > 0) {
          result = e.message.substring(loc1);
          errObj = JSON.parse(result);
        }
    }
    result = errObj['odata.error']['message']['value'];
    console.log('errObj:',errObj);
    console.log('result:',result);
    return result;
  }
  

  private CreateTTIMTimeList(oldVal: any): any {

    let listName = this.properties.localListName ? this.properties.localListName : 'TrackMyTime';
    let listDesc = 'TrackMyTime list for TrackMyTime Webpart';
    console.log('CreateTTIMTimeList: oldVal', oldVal);

    let listCreated = this.ensureTrackTimeList(listName, listDesc, 'TrackMyTime');
    
    if ( listCreated ) { 
      this.properties.localListName= listName;
      this.properties.localListConfirmed= true;
      
    }
     return "Finished";  
  } 

  private CreateTTIMProjectList(oldVal: any): any {

    let listName = this.properties.localListName ? this.properties.localListName : 'Projects';
    let listDesc = 'Projects list for TrackMyTime Webpart';
    console.log('CreateTTIMProjectList: oldVal', oldVal);

    let listCreated = this.ensureTrackTimeList(listName, listDesc, 'Project');
    
    if ( listCreated ) { 
      this.properties.localListName= listName;
      this.properties.localListConfirmed= true;
      
    }
     return "Finished";  
  } 


  private CreateSocialiis7List(oldVal: any): any {

    let listName = this.properties.localListName ? this.properties.localListName : 'Entities';
    let listDesc = 'Hey, this may actually work!';
    console.log('CreateSocialiis7List: oldVal', oldVal);
    let listCreated = this.ensureSocialiis7List(listName, listDesc);

    if ( listCreated ) { 
      this.properties.localListName= listName;
      this.properties.localListConfirmed= true;
      
    }
     return "Finished";  
  } 


  public render(): void {
    const element: React.ReactElement<IAssetBuilderProps > = React.createElement(
      AssetBuilder,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [ 

                PropertyPaneButton('CreateSocialiis7List',  
                {  
                 text: "Create/Verify Socialiis List",  
                 buttonType: PropertyPaneButtonType.Normal,  
                 onClick: this.CreateSocialiis7List.bind(this)
                }), 

                PropertyPaneButton('CreCreateTTIMProjectListateList1',  
                {  
                 text: "Create/Verify TrackMyTime Projects List",  
                 buttonType: PropertyPaneButtonType.Normal,  
                 onClick: this.CreateTTIMProjectList.bind(this)
                }),

                PropertyPaneButton('CreateTTIMTimeList',  
                {  
                 text: "Create/Verify TrackMyTime List",  
                 buttonType: PropertyPaneButtonType.Normal,  
                 onClick: this.CreateTTIMTimeList.bind(this)
                }),
                
                PropertyPaneLabel('confirmation', {
                  text: this.properties.localListConfirmed ? this.properties.localListName + ' List is available' : 'Verify or Create your list!'
                }),

                PropertyPaneTextField('localListName', {
                  label: strings.LocalListFieldLabel
                }),

                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {  
    if (propertyPath === 'localListName' &&  newValue) {  
      this.properties.localListName=newValue;  
    }  
  } 

}
