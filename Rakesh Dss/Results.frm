VERSION 5.00
Object = "{F9043C88-F6F2-101A-A3C9-08002B2F49FB}#1.2#0"; "comdlg32.ocx"
Begin VB.Form Results 
   BackColor       =   &H8000000D&
   Caption         =   "Results"
   ClientHeight    =   8940
   ClientLeft      =   60
   ClientTop       =   450
   ClientWidth     =   9585
   ForeColor       =   &H000000FF&
   LinkTopic       =   "Form1"
   ScaleHeight     =   8940
   ScaleWidth      =   9585
   StartUpPosition =   3  'Windows Default
   Begin VB.Frame Frame3 
      BackColor       =   &H00FFFFC0&
      Height          =   2175
      Left            =   5520
      TabIndex        =   45
      Top             =   1920
      Width           =   3375
      Begin VB.TextBox Text10 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   2460
         TabIndex        =   50
         Top             =   240
         Width           =   855
      End
      Begin VB.TextBox Text11 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   2460
         TabIndex        =   49
         Top             =   600
         Width           =   855
      End
      Begin VB.TextBox Text12 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   2460
         TabIndex        =   48
         Top             =   960
         Width           =   855
      End
      Begin VB.TextBox Text13 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   2460
         TabIndex        =   47
         Top             =   1320
         Width           =   855
      End
      Begin VB.TextBox Text14 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   2460
         TabIndex        =   46
         Top             =   1680
         Width           =   855
      End
      Begin VB.Label Label13 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Area to be covered, ha"
         Height          =   255
         Left            =   720
         TabIndex        =   55
         Top             =   1440
         Width           =   1695
      End
      Begin VB.Label Label12 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Actual Field Capacity, ha/h"
         Height          =   255
         Left            =   480
         TabIndex        =   54
         Top             =   1080
         Width           =   2055
      End
      Begin VB.Label Label11 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Field Efficiency, %"
         Height          =   255
         Left            =   1080
         TabIndex        =   53
         Top             =   720
         Width           =   1335
      End
      Begin VB.Label Label10 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Theoretical Field Capacity, ha/h"
         Height          =   255
         Left            =   120
         TabIndex        =   52
         Top             =   240
         Width           =   2295
      End
      Begin VB.Label Label14 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Total Time Requirement, h"
         Height          =   255
         Left            =   480
         TabIndex        =   51
         Top             =   1800
         Width           =   2055
      End
   End
   Begin VB.Frame Frame6 
      BackColor       =   &H00FFFFC0&
      Height          =   975
      Left            =   5520
      TabIndex        =   40
      Top             =   4080
      Width           =   3375
      Begin VB.TextBox Text22 
         BackColor       =   &H00FFC0FF&
         Height          =   285
         Left            =   2280
         TabIndex        =   42
         Top             =   240
         Width           =   975
      End
      Begin VB.TextBox Text23 
         BackColor       =   &H00FFC0FF&
         Height          =   285
         Left            =   2280
         TabIndex        =   41
         Top             =   600
         Width           =   975
      End
      Begin VB.Label Label24 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Specific Fuel Consumption,                           l/kW-h"
         ForeColor       =   &H00400000&
         Height          =   375
         Left            =   120
         TabIndex        =   44
         Top             =   240
         Width           =   2175
      End
      Begin VB.Label Label25 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Total Fuel Consumed, l/ha"
         ForeColor       =   &H00400000&
         Height          =   255
         Left            =   120
         TabIndex        =   43
         Top             =   600
         Width           =   2175
      End
   End
   Begin MSComDlg.CommonDialog CommonDialog1 
      Left            =   2160
      Top             =   8400
      _ExtentX        =   847
      _ExtentY        =   847
      _Version        =   393216
   End
   Begin VB.CommandButton Command2 
      BackColor       =   &H0080FF80&
      Caption         =   "Save"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   375
      Left            =   4560
      MaskColor       =   &H00004040&
      TabIndex        =   35
      Top             =   8400
      Width           =   1815
   End
   Begin VB.Frame Frame5 
      BackColor       =   &H00C0C0FF&
      Caption         =   "Tractor performance after ballast"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00000000&
      Height          =   1575
      Left            =   720
      TabIndex        =   24
      Top             =   6360
      Visible         =   0   'False
      Width           =   8175
      Begin VB.TextBox Text16 
         BackColor       =   &H00FFC0FF&
         Enabled         =   0   'False
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         ForeColor       =   &H00000000&
         Height          =   375
         Index           =   1
         Left            =   480
         Locked          =   -1  'True
         TabIndex        =   29
         Text            =   " "
         Top             =   960
         Width           =   855
      End
      Begin VB.TextBox Text17 
         BackColor       =   &H00FFC0FF&
         Enabled         =   0   'False
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         ForeColor       =   &H00000000&
         Height          =   375
         Left            =   1920
         Locked          =   -1  'True
         TabIndex        =   28
         Text            =   " "
         Top             =   960
         Width           =   975
      End
      Begin VB.TextBox Text18 
         BackColor       =   &H00FFC0FF&
         Enabled         =   0   'False
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         ForeColor       =   &H00000000&
         Height          =   375
         Index           =   1
         Left            =   3480
         Locked          =   -1  'True
         TabIndex        =   27
         Text            =   " "
         Top             =   960
         Width           =   855
      End
      Begin VB.TextBox Text19 
         BackColor       =   &H00FFC0FF&
         Enabled         =   0   'False
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         ForeColor       =   &H00000000&
         Height          =   375
         Index           =   0
         Left            =   4920
         Locked          =   -1  'True
         TabIndex        =   26
         Text            =   " "
         Top             =   960
         Width           =   615
      End
      Begin VB.TextBox Text20 
         BackColor       =   &H00FFC0FF&
         Enabled         =   0   'False
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         ForeColor       =   &H00000000&
         Height          =   375
         Index           =   0
         Left            =   6480
         Locked          =   -1  'True
         TabIndex        =   25
         Text            =   " "
         Top             =   960
         Width           =   735
      End
      Begin VB.Label Label18 
         Alignment       =   2  'Center
         BackStyle       =   0  'Transparent
         Caption         =   "Required ballast on rear, kg"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   495
         Index           =   1
         Left            =   120
         TabIndex        =   34
         Top             =   360
         Width           =   1575
      End
      Begin VB.Label Label19 
         Alignment       =   2  'Center
         BackStyle       =   0  'Transparent
         Caption         =   "Required ballast on front, kg"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   495
         Index           =   1
         Left            =   1680
         TabIndex        =   33
         Top             =   360
         Width           =   1695
      End
      Begin VB.Label Label21 
         AutoSize        =   -1  'True
         BackStyle       =   0  'Transparent
         Caption         =   "Slip, %"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   240
         Index           =   0
         Left            =   3480
         TabIndex        =   32
         Top             =   615
         Width           =   615
      End
      Begin VB.Label Label22 
         AutoSize        =   -1  'True
         BackStyle       =   0  'Transparent
         Caption         =   "COT"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   240
         Index           =   0
         Left            =   4920
         TabIndex        =   31
         Top             =   615
         Width           =   540
      End
      Begin VB.Label Label23 
         Alignment       =   2  'Center
         BackStyle       =   0  'Transparent
         Caption         =   "Tractive efficiency, %"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   9.75
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   375
         Index           =   0
         Left            =   5880
         TabIndex        =   30
         Top             =   600
         Width           =   1935
      End
   End
   Begin VB.Frame Frame4 
      BackColor       =   &H008080FF&
      Caption         =   "Recommendation"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C00000&
      Height          =   1335
      Left            =   720
      TabIndex        =   21
      Top             =   5040
      Width           =   8175
      Begin VB.Frame Frame7 
         BackColor       =   &H00C0FFFF&
         Height          =   735
         Left            =   600
         TabIndex        =   56
         Top             =   600
         Width           =   6255
         Begin VB.Label Label27 
            BackColor       =   &H00C0FFFF&
            BeginProperty Font 
               Name            =   "MS Sans Serif"
               Size            =   12
               Charset         =   0
               Weight          =   700
               Underline       =   0   'False
               Italic          =   0   'False
               Strikethrough   =   0   'False
            EndProperty
            ForeColor       =   &H000000C0&
            Height          =   375
            Index           =   0
            Left            =   1680
            TabIndex        =   58
            Top             =   240
            Width           =   3735
         End
         Begin VB.Label Label26 
            BackColor       =   &H00C0FFFF&
            Caption         =   "Tractor is "
            BeginProperty Font 
               Name            =   "MS Sans Serif"
               Size            =   12
               Charset         =   0
               Weight          =   700
               Underline       =   0   'False
               Italic          =   0   'False
               Strikethrough   =   0   'False
            EndProperty
            ForeColor       =   &H000000C0&
            Height          =   375
            Left            =   240
            TabIndex        =   57
            Top             =   240
            Width           =   1215
         End
      End
      Begin VB.Label Label17 
         AutoSize        =   -1  'True
         BackColor       =   &H008080FF&
         Caption         =   "Label17"
         ForeColor       =   &H00800000&
         Height          =   195
         Left            =   960
         TabIndex        =   23
         Top             =   360
         Width           =   570
      End
      Begin VB.Label Label16 
         BackStyle       =   0  'Transparent
         Height          =   735
         Left            =   720
         TabIndex        =   22
         Top             =   600
         Width           =   6495
      End
   End
   Begin VB.Frame Frame1 
      BackColor       =   &H00FFFFC0&
      Height          =   3135
      Left            =   720
      TabIndex        =   6
      Top             =   1920
      Width           =   4815
      Begin VB.TextBox Text1 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   13
         Top             =   240
         Width           =   975
      End
      Begin VB.TextBox Text2 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   12
         Top             =   600
         Width           =   975
      End
      Begin VB.TextBox Text3 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   11
         Top             =   960
         Width           =   975
      End
      Begin VB.TextBox Text4 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   10
         Top             =   1320
         Width           =   975
      End
      Begin VB.TextBox Text5 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   9
         Top             =   1680
         Width           =   975
      End
      Begin VB.TextBox Text6 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   8
         Top             =   2040
         Width           =   975
      End
      Begin VB.TextBox Text7 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H80000007&
         Height          =   375
         Left            =   3240
         TabIndex        =   7
         Top             =   2400
         Width           =   975
      End
      Begin VB.Label Label1 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Draft Requirement, kN"
         Height          =   375
         Left            =   1320
         TabIndex        =   20
         Top             =   240
         Width           =   1935
      End
      Begin VB.Label Label2 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Drawbar Power Required, kW"
         Height          =   255
         Left            =   840
         TabIndex        =   19
         Top             =   600
         Width           =   2415
      End
      Begin VB.Label Label3 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Wheel Slip, %"
         Height          =   375
         Left            =   1680
         TabIndex        =   18
         Top             =   960
         Width           =   1575
      End
      Begin VB.Label Label4 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Coefficient of Net Traction"
         Height          =   255
         Left            =   1320
         TabIndex        =   17
         Top             =   1320
         Width           =   1935
      End
      Begin VB.Label Label5 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Motion resistance ratio"
         Height          =   375
         Left            =   1080
         TabIndex        =   16
         Top             =   1680
         Width           =   2175
      End
      Begin VB.Label Label6 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Tractive Efficiency, %"
         Height          =   255
         Left            =   1440
         TabIndex        =   15
         Top             =   2040
         Width           =   1815
      End
      Begin VB.Label Label7 
         BackColor       =   &H00FFFFC0&
         Caption         =   "Front Wheel Weight Utilization Factor"
         Height          =   375
         Left            =   360
         TabIndex        =   14
         Top             =   2400
         Width           =   2895
      End
   End
   Begin VB.CommandButton Command1 
      BackColor       =   &H0080FF80&
      Caption         =   "Back To Front Screen"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   375
      Left            =   6840
      MaskColor       =   &H00004040&
      Picture         =   "Results.frx":0000
      TabIndex        =   3
      Top             =   8400
      Width           =   2415
   End
   Begin VB.Frame Frame2 
      BackColor       =   &H00FFFF00&
      ForeColor       =   &H00008080&
      Height          =   1455
      Left            =   720
      TabIndex        =   0
      Top             =   480
      Width           =   8175
      Begin VB.TextBox Text21 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H00000000&
         Height          =   285
         Left            =   6360
         TabIndex        =   38
         Text            =   "Text21"
         Top             =   720
         Width           =   735
      End
      Begin VB.TextBox Text8 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H00000000&
         Height          =   405
         Left            =   2280
         TabIndex        =   37
         Top             =   240
         Width           =   2295
      End
      Begin VB.TextBox Text15 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H00000000&
         Height          =   285
         Left            =   2640
         TabIndex        =   5
         Top             =   720
         Width           =   975
      End
      Begin VB.TextBox Text9 
         BackColor       =   &H00FFC0FF&
         ForeColor       =   &H00000000&
         Height          =   285
         Left            =   6360
         TabIndex        =   2
         Top             =   240
         Width           =   735
      End
      Begin VB.Label Label20 
         BackColor       =   &H00FFFF00&
         Caption         =   "Overall Efficiency, %"
         ForeColor       =   &H000000C0&
         Height          =   255
         Left            =   4560
         TabIndex        =   39
         Top             =   720
         Width           =   1815
      End
      Begin VB.Label Label8 
         BackColor       =   &H00FFFF00&
         Caption         =   "Tractor Make and Model"
         ForeColor       =   &H000000C0&
         Height          =   255
         Left            =   360
         TabIndex        =   36
         Top             =   240
         Width           =   1935
      End
      Begin VB.Label Label15 
         BackColor       =   &H00FFFF00&
         Caption         =   "Power Used, %"
         ForeColor       =   &H000000C0&
         Height          =   255
         Left            =   480
         TabIndex        =   4
         Top             =   720
         Width           =   1215
      End
      Begin VB.Label Label9 
         BackColor       =   &H00FFFF00&
         Caption         =   "Tractor Power, kW"
         ForeColor       =   &H000000C0&
         Height          =   255
         Left            =   4680
         TabIndex        =   1
         Top             =   240
         Width           =   1575
      End
   End
End
Attribute VB_Name = "Results"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

Private Sub Command1_Click()
Me.Hide
Front_screen.Show
End Sub

Private Sub Command2_Click()
With CommonDialog1

.Filter = "MsExcel (*.xls)| *.xls"
.ShowSave
If .FileName = "" Then
    Exit Sub
Else
     Dim x1 As Object
    Dim sheet As Object
    Set x1 = CreateObject("Excel.Application")
    x1.Workbooks.Add
    Set sheet = x1.ActiveWorkbook.Sheets(1)
        sheet.Cells(1, 1).Value = Label8.Caption
    sheet.Cells(1, 2).Value = Text8.Text
    sheet.Cells(2, 1).Value = Label9.Caption
    sheet.Cells(2, 2).Value = Text9.Text
    sheet.Cells(3, 1).Value = "Implement"
    sheet.Cells(3, 2).Value = Front_screen.Label1.Caption
    sheet.Cells(4, 1).Value = "Depth of operation, cm"
    sheet.Cells(4, 2).Value = Val(Front_screen.Combo1.Text)
    sheet.Cells(5, 1).Value = "Speed of operation, kmph"
    sheet.Cells(5, 2).Value = Val(Front_screen.Combo2.Text)
    sheet.Cells(6, 1).Value = "Cone Index of soil, kPa"
    sheet.Cells(6, 2).Value = Val(Front_screen.Combo3.Text)
    sheet.Cells(7, 1).Value = Label1.Caption
    sheet.Cells(7, 2).Value = Text1.Text
    sheet.Cells(8, 1).Value = Label2.Caption
    sheet.Cells(8, 2).Value = Text2.Text
    sheet.Cells(9, 1).Value = Label3.Caption
    sheet.Cells(9, 2).Value = Text3.Text
    sheet.Cells(10, 1).Value = Label4.Caption
    sheet.Cells(10, 2).Value = Text4.Text
    sheet.Cells(11, 1).Value = Label5.Caption
    sheet.Cells(11, 2).Value = Text5.Text
    sheet.Cells(12, 1).Value = Label6.Caption
    sheet.Cells(12, 2).Value = Text6.Text
    sheet.Cells(13, 1).Value = Label7.Caption
    sheet.Cells(13, 2).Value = Text7.Text
    sheet.Cells(14, 1).Value = Label10.Caption
    sheet.Cells(14, 2).Value = Text10.Text
    sheet.Cells(15, 1).Value = Label11.Caption
    sheet.Cells(15, 2).Value = Text11.Text
    sheet.Cells(16, 1).Value = Label12.Caption
    sheet.Cells(16, 2).Value = Text12.Text
    sheet.Cells(17, 1).Value = Label13.Caption
    sheet.Cells(17, 2).Value = Text13.Text
    sheet.Cells(18, 1).Value = Label14.Caption
    sheet.Cells(18, 2).Value = Text14.Text
    sheet.Cells(19, 1).Value = Label24.Caption
    sheet.Cells(19, 2).Value = Text22.Text
    sheet.Cells(20, 1).Value = Label25.Caption
    sheet.Cells(20, 2).Value = Text23.Text
    
    sheet.Cells(22, 1).Value = Label15.Caption
    sheet.Cells(22, 2).Value = Text15.Text
    sheet.Cells(23, 1).Value = Label20.Caption
    sheet.Cells(23, 2).Value = Text21.Text
    
    
    
    sheet.Cells(25, 1).Value = "RECOMMENDATION "
    sheet.Cells(25, 2).Value = Label17.Caption
    sheet.Cells(26, 2).Value = "Tractor is"
    sheet.Cells(26, 3).Value = Label27(0).Caption
    sheet.Cells(28, 1).Value = " "
    sheet.Cells(28, 2).Value = "Tractor Performance after adding ballast"
    
    sheet.Cells(30, 1).Value = Label18(1).Caption
    sheet.Cells(30, 2).Value = Text16(1).Text
    sheet.Cells(31, 1).Value = Label19(1).Caption
    sheet.Cells(31, 2).Value = Text17.Text
    sheet.Cells(32, 1).Value = Label21(0).Caption
    sheet.Cells(32, 2).Value = Text18(1).Text
    sheet.Cells(33, 1).Value = Label22(0).Caption
    sheet.Cells(33, 2).Value = Text19(0).Text
    sheet.Cells(34, 1).Value = Label23(0).Caption
    sheet.Cells(34, 2).Value = Text20(0).Text
    
    
      If Text16(1).Text = "" Then
       sheet.Cells(30, 2).Value = "Not Required"
       End If
       If Text17.Text = "" Then
       sheet.Cells(31, 2).Value = "Not Required"
       End If
       If Text18(1).Text = "" Then
       sheet.Cells(32, 2).Value = Text3.Text
       End If
       If Text19(0).Text = "" Then
       sheet.Cells(33, 2).Value = Text4.Text
       End If
       If Text19(0).Text = "" Then
       sheet.Cells(34, 2).Value = Text6.Text
       End If
    sheet.SaveAs .FileName
    x1.Visible = True
    'x1.Quit
    Set x1 = Nothing
End If
End With
End Sub

