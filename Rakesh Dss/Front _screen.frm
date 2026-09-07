VERSION 5.00
Begin VB.Form Front_screen 
   BackColor       =   &H0000C000&
   Caption         =   "WELCOME"
   ClientHeight    =   8985
   ClientLeft      =   60
   ClientTop       =   450
   ClientWidth     =   11640
   ForeColor       =   &H8000000D&
   LinkTopic       =   "Form1"
   ScaleHeight     =   8985
   ScaleWidth      =   11640
   StartUpPosition =   2  'CenterScreen
   WindowState     =   2  'Maximized
   Begin VB.Frame Frame9 
      BackColor       =   &H00008000&
      Height          =   615
      Left            =   4080
      TabIndex        =   46
      Top             =   7680
      Width           =   4095
      Begin VB.CommandButton Command6 
         Caption         =   "Simulate"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   12
            Charset         =   0
            Weight          =   700
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   960
         TabIndex        =   47
         Top             =   240
         Width           =   1695
      End
   End
   Begin VB.Frame Frame5 
      BackColor       =   &H00008000&
      Caption         =   "Soil and Operating Parameters"
      ForeColor       =   &H8000000D&
      Height          =   5295
      Left            =   7080
      TabIndex        =   27
      Top             =   1080
      Width           =   4215
      Begin VB.TextBox Text5 
         BackColor       =   &H00C0E0FF&
         ForeColor       =   &H00800000&
         Height          =   285
         Left            =   2280
         TabIndex        =   51
         Text            =   "86"
         Top             =   4440
         Width           =   375
      End
      Begin VB.TextBox Text4 
         BackColor       =   &H00C0E0FF&
         ForeColor       =   &H00800000&
         Height          =   285
         Left            =   2280
         TabIndex        =   50
         Text            =   "20"
         Top             =   4080
         Width           =   375
      End
      Begin VB.Frame Frame8 
         BackColor       =   &H00008000&
         Caption         =   "Based on hardness"
         ForeColor       =   &H0080C0FF&
         Height          =   1695
         Left            =   2040
         TabIndex        =   37
         Top             =   360
         Width           =   1575
         Begin VB.OptionButton Option12 
            BackColor       =   &H00008000&
            Caption         =   "Soft Soil"
            ForeColor       =   &H0000FFFF&
            Height          =   195
            Left            =   240
            TabIndex        =   41
            Top             =   1200
            Width           =   975
         End
         Begin VB.OptionButton Option11 
            BackColor       =   &H00008000&
            Caption         =   "Tilled Soil"
            ForeColor       =   &H0000FFFF&
            Height          =   195
            Left            =   240
            TabIndex        =   40
            Top             =   880
            Width           =   975
         End
         Begin VB.OptionButton Option10 
            BackColor       =   &H00008000&
            Caption         =   "Firm Soil"
            ForeColor       =   &H0000FFFF&
            Height          =   195
            Left            =   240
            TabIndex        =   39
            Top             =   560
            Width           =   975
         End
         Begin VB.OptionButton Option9 
            BackColor       =   &H00008000&
            Caption         =   "Hard Soil"
            ForeColor       =   &H0000FFFF&
            Height          =   195
            Left            =   240
            TabIndex        =   38
            Top             =   240
            Width           =   975
         End
      End
      Begin VB.Frame Frame7 
         BackColor       =   &H00008000&
         Height          =   1815
         Left            =   480
         TabIndex        =   32
         Top             =   2040
         Width           =   3255
         Begin VB.ComboBox Combo3 
            BackColor       =   &H00FFC0FF&
            ForeColor       =   &H00800000&
            Height          =   315
            Left            =   2040
            TabIndex        =   42
            Top             =   1320
            Width           =   855
         End
         Begin VB.ComboBox Combo1 
            BackColor       =   &H00FFC0FF&
            ForeColor       =   &H00800000&
            Height          =   315
            Left            =   2040
            TabIndex        =   36
            Top             =   360
            Width           =   855
         End
         Begin VB.ComboBox Combo2 
            BackColor       =   &H00FFC0FF&
            ForeColor       =   &H00800000&
            Height          =   315
            Left            =   2040
            TabIndex        =   35
            Top             =   840
            Width           =   855
         End
         Begin VB.Label Label10 
            BackColor       =   &H00008000&
            Caption         =   "Cone Index, kPa"
            ForeColor       =   &H0000FFFF&
            Height          =   375
            Left            =   240
            TabIndex        =   43
            Top             =   1320
            Width           =   1455
         End
         Begin VB.Label Label9 
            BackColor       =   &H00008000&
            Caption         =   "Depth of operation, cm"
            ForeColor       =   &H0000FFFF&
            Height          =   375
            Left            =   120
            TabIndex        =   34
            Top             =   360
            Width           =   1815
         End
         Begin VB.Label Label8 
            BackColor       =   &H00008000&
            Caption         =   "Speed of operation, km/h"
            ForeColor       =   &H0000FFFF&
            Height          =   375
            Left            =   120
            TabIndex        =   33
            Top             =   840
            Width           =   1815
         End
      End
      Begin VB.Frame Frame6 
         BackColor       =   &H00008000&
         Caption         =   "Based on  texture "
         ForeColor       =   &H0080C0FF&
         Height          =   1695
         Left            =   480
         TabIndex        =   28
         Top             =   360
         Width           =   1455
         Begin VB.OptionButton Option8 
            BackColor       =   &H00008000&
            Caption         =   "Medium Soil"
            ForeColor       =   &H0080FFFF&
            Height          =   255
            Left            =   120
            TabIndex        =   31
            Top             =   1080
            Width           =   1215
         End
         Begin VB.OptionButton Option7 
            BackColor       =   &H00008000&
            Caption         =   "Coarse Soil"
            ForeColor       =   &H0080FFFF&
            Height          =   255
            Left            =   120
            TabIndex        =   30
            Top             =   720
            Width           =   1095
         End
         Begin VB.OptionButton Option6 
            BackColor       =   &H00008000&
            Caption         =   "Fine Soil"
            ForeColor       =   &H0080FFFF&
            Height          =   255
            Left            =   120
            TabIndex        =   29
            Top             =   360
            Width           =   1095
         End
      End
      Begin VB.Label Label13 
         BackColor       =   &H00008000&
         Caption         =   "Transmission Efficeiency, %"
         ForeColor       =   &H0000FFFF&
         Height          =   255
         Left            =   240
         TabIndex        =   53
         Top             =   4440
         Width           =   2055
      End
      Begin VB.Label Label12 
         BackColor       =   &H00008000&
         Caption         =   "Power Reserve, %"
         ForeColor       =   &H0000FFFF&
         Height          =   255
         Left            =   720
         TabIndex        =   52
         Top             =   4080
         Width           =   1455
      End
   End
   Begin VB.Frame Frame4 
      BackColor       =   &H00008000&
      Caption         =   "Area"
      ForeColor       =   &H00C0C0FF&
      Height          =   3135
      Left            =   4920
      TabIndex        =   6
      Top             =   3240
      Width           =   2175
      Begin VB.TextBox Text1 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00008000&
         Height          =   375
         Left            =   1200
         TabIndex        =   22
         Text            =   "400"
         Top             =   480
         Width           =   615
      End
      Begin VB.TextBox Text2 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00008000&
         Height          =   375
         Left            =   1200
         TabIndex        =   21
         Text            =   "200"
         Top             =   960
         Width           =   615
      End
      Begin VB.TextBox Text3 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00008000&
         Height          =   375
         Left            =   900
         MultiLine       =   -1  'True
         TabIndex        =   20
         Top             =   1920
         Width           =   615
      End
      Begin VB.CommandButton Command4 
         BackColor       =   &H80000013&
         Caption         =   "Area of plot is "
         Height          =   495
         Left            =   960
         TabIndex        =   19
         Top             =   1320
         Width           =   1095
      End
      Begin VB.Label Label4 
         BackColor       =   &H00008000&
         Caption         =   "Length, m"
         ForeColor       =   &H0080FFFF&
         Height          =   375
         Left            =   240
         TabIndex        =   26
         Top             =   480
         Width           =   855
      End
      Begin VB.Label Label5 
         BackColor       =   &H00008000&
         Caption         =   "Width, m"
         ForeColor       =   &H0080FFFF&
         Height          =   375
         Left            =   240
         TabIndex        =   25
         Top             =   960
         Width           =   855
      End
      Begin VB.Label Label7 
         BackColor       =   &H00008000&
         ForeColor       =   &H0080FFFF&
         Height          =   375
         Left            =   1560
         TabIndex        =   24
         Top             =   2040
         Width           =   495
      End
      Begin VB.Label Label6 
         BackColor       =   &H00008000&
         Caption         =   "Area"
         ForeColor       =   &H0080FFFF&
         Height          =   375
         Left            =   240
         TabIndex        =   23
         Top             =   1920
         Width           =   615
      End
   End
   Begin VB.Frame Frame3 
      BackColor       =   &H00008000&
      Caption         =   "Tractor Selection"
      ForeColor       =   &H00C0C0FF&
      Height          =   3135
      Left            =   120
      TabIndex        =   5
      Top             =   3240
      Width           =   4815
      Begin VB.CommandButton Command8 
         Caption         =   "Specifications"
         Height          =   495
         Left            =   3480
         TabIndex        =   48
         Top             =   2280
         Width           =   1215
      End
      Begin VB.CommandButton Command5 
         Caption         =   "Selected"
         Height          =   495
         Left            =   2160
         TabIndex        =   45
         Top             =   2280
         Width           =   1215
      End
      Begin VB.CommandButton Command3 
         Caption         =   "And Model is"
         Height          =   555
         Left            =   1680
         TabIndex        =   16
         Top             =   1440
         Width           =   1335
      End
      Begin VB.ListBox List4 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00000080&
         Height          =   450
         Left            =   3120
         TabIndex        =   15
         Top             =   1560
         Width           =   1455
      End
      Begin VB.ListBox List3 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00000080&
         Height          =   450
         Left            =   360
         TabIndex        =   14
         Top             =   1440
         Width           =   1215
      End
      Begin VB.OptionButton Option5 
         BackColor       =   &H00008000&
         Caption         =   "above 35 kW"
         ForeColor       =   &H0080FFFF&
         Height          =   255
         Left            =   3240
         TabIndex        =   13
         Top             =   360
         Width           =   1455
      End
      Begin VB.OptionButton Option4 
         BackColor       =   &H00008000&
         Caption         =   "25 - 35 kW"
         ForeColor       =   &H0080FFFF&
         Height          =   255
         Left            =   1800
         TabIndex        =   12
         Top             =   360
         Width           =   1455
      End
      Begin VB.OptionButton Option3 
         BackColor       =   &H00008000&
         Caption         =   "Below 25 kW"
         ForeColor       =   &H0080FFFF&
         Height          =   255
         Left            =   120
         TabIndex        =   11
         Top             =   360
         Width           =   1455
      End
      Begin VB.Label Label11 
         BackColor       =   &H00008000&
         Caption         =   "Label11"
         ForeColor       =   &H00800000&
         Height          =   495
         Left            =   120
         TabIndex        =   44
         Top             =   2280
         Width           =   1935
      End
      Begin VB.Label Label3 
         BackColor       =   &H80000016&
         BackStyle       =   0  'Transparent
         Caption         =   "Tractor Model"
         ForeColor       =   &H80000017&
         Height          =   255
         Left            =   3240
         TabIndex        =   18
         Top             =   1320
         Width           =   1335
      End
      Begin VB.Label Label2 
         BackColor       =   &H80000016&
         BackStyle       =   0  'Transparent
         Caption         =   "Tractor Make"
         ForeColor       =   &H80000017&
         Height          =   255
         Left            =   360
         TabIndex        =   17
         Top             =   1200
         Width           =   1575
      End
   End
   Begin VB.Frame Frame2 
      BackColor       =   &H00008000&
      Caption         =   "Implement"
      ForeColor       =   &H00C0C0FF&
      Height          =   2175
      Left            =   2400
      TabIndex        =   3
      Top             =   1080
      Width           =   4815
      Begin VB.CommandButton Command7 
         BackColor       =   &H00008000&
         Caption         =   "Specifications"
         Height          =   255
         Left            =   2880
         TabIndex        =   49
         Top             =   1560
         Width           =   1455
      End
      Begin VB.CommandButton Command2 
         BackColor       =   &H00008000&
         Caption         =   "selected"
         Height          =   375
         Left            =   2520
         TabIndex        =   10
         Top             =   1080
         Width           =   1215
      End
      Begin VB.ListBox List2 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00000080&
         Height          =   450
         Left            =   2760
         TabIndex        =   8
         Top             =   360
         Width           =   1335
      End
      Begin VB.CommandButton Command1 
         Appearance      =   0  'Flat
         BackColor       =   &H00008000&
         Cancel          =   -1  'True
         Caption         =   "Size is"
         Default         =   -1  'True
         Height          =   495
         Left            =   1800
         MaskColor       =   &H000080FF&
         OLEDropMode     =   1  'Manual
         TabIndex        =   7
         Top             =   360
         UseMaskColor    =   -1  'True
         Width           =   855
      End
      Begin VB.ListBox List1 
         BackColor       =   &H00FFC0C0&
         ForeColor       =   &H00000080&
         Height          =   450
         Left            =   120
         TabIndex        =   4
         Top             =   360
         Width           =   1455
      End
      Begin VB.Label Label1 
         BackColor       =   &H00008000&
         Caption         =   "Label1"
         ForeColor       =   &H0080FFFF&
         Height          =   375
         Left            =   120
         TabIndex        =   9
         Top             =   1080
         Width           =   2055
      End
   End
   Begin VB.Frame Frame1 
      BackColor       =   &H00008000&
      Caption         =   "Tillage Practice"
      ForeColor       =   &H00C0C0FF&
      Height          =   2175
      Left            =   120
      TabIndex        =   0
      Top             =   1080
      Width           =   2295
      Begin VB.OptionButton Option2 
         BackColor       =   &H00008000&
         Caption         =   "Secondary"
         ForeColor       =   &H0000FFFF&
         Height          =   255
         Left            =   240
         TabIndex        =   2
         Top             =   960
         Width           =   1335
      End
      Begin VB.OptionButton Option1 
         BackColor       =   &H00008000&
         Caption         =   "Primary"
         ForeColor       =   &H0000FFFF&
         Height          =   255
         Left            =   240
         TabIndex        =   1
         Top             =   360
         Width           =   1335
      End
   End
End
Attribute VB_Name = "Front_screen"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False


Private Sub Command1_Click()
If List1.Text = "" Then
MsgBox ("Click me after selecting implement")
Else
If List1.Text = "MB Plough" Then
List2.Clear
List2.AddItem "1"
List2.AddItem "2"
List2.AddItem "3"
Label1.Caption = " "
MsgBox ("select number of bottom")
End If
If List1.Text = "Disc Plough" Then
List2.Clear
List2.AddItem "1"
List2.AddItem "2"
List2.AddItem "3"
Label1.Caption = " "
MsgBox ("select number of discs")
End If

If List1.Text = "Disc Harrow" Then
List2.Clear
List2.AddItem "5 x 5"
List2.AddItem "6 x 6"
List2.AddItem "7 x 7"
List2.AddItem "8 x 8"
Label1.Caption = " "
MsgBox ("select size of disc harrow")
End If

If List1.Text = "Cultivator" Then
List2.Clear
List2.AddItem "9"
List2.AddItem "11"
List2.AddItem "13"
Label1.Caption = " "
MsgBox ("select number of tynes of cultivator")
End If
End If

End Sub

Private Sub Command2_Click()
'mb plow
If List1.Text = "MB Plough" Then
If List2.Text = "1" Then
Label1.Visible = True
Label1.Caption = " One bottom M B Plough"
MsgBox (" Please Enter my Specifications")
End If
If List2.Text = "2" Then
Label1.Visible = True
Label1.Caption = "Two bottom M B Plough"
' implement specification
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = " Size of each bottom, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of bottoms"
.Text1 = " M. B. Plow"
.Text2 = 30
.Text3 = 2
.Text4 = 0.6
.Text5 = 225 'check
.Text6 = 0.55
.Text7 = 0.2
.Text8 = 652
.Text9 = 0
.Text10 = 5.1
End With
End If
If List2.Text = "3" Then
Label1.Visible = True
Label1.Caption = " Three bottom M B Plough"
' implement specification
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = " Size of each bottom, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of bottoms"
.Text1 = " M. B. Plow"
.Text2 = 36
.Text3 = 3
.Text4 = 1.08
.Text5 = 350 'check
.Text6 = 0.7
.Text7 = 0.2
.Text8 = 652
.Text9 = 0
.Text10 = 5.1
End With
End If

End If


'disk plow
If List1.Text = "Disc Plough" Then
If List2.Text = "1" Then
Label1.Visible = True
Label1.Caption = " One Bottom Disc Plough"
' implement specifications
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = " Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of disc"
.Text1 = " Disc Plow"
.Text2 = 61
.Text3 = 1
.Text4 = 0.45 ' D cos 45
.Text5 = 150 'check
.Text6 = 0.5
.Text7 = 0#   'check
.Text8 = 124
.Text9 = 6.4
.Text10 = 0
End With
End If
If List2.Text = "2" Then
Label1.Visible = True
Label1.Caption = " Two Bottoms Disc Plough"
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = " Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of disc"
.Text1 = " Disc Plow"
.Text2 = 61
.Text3 = 2
.Text4 = 0.75 ' NS + D cos 45 = 1*30+61*cos 45
.Text5 = 260 'doubt
.Text6 = 0.65
.Text7 = 0#   'check
.Text8 = 124
.Text9 = 6.4
.Text10 = 0
End With
End If
If List2.Text = "3" Then
Label1.Visible = True
Label1.Caption = " Three Bottom Disc Plough"
MsgBox (" Please Enter my Specifications")
End If
End If

'cultivator

If List1.Text = "Cultivator" Then
If List2.Text = "9" Then
Label1.Visible = True
Label1.Caption = "9-tynes Cultivator"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Size of each tyne, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of tynes"
.Text1 = " Cultivator"
.Text2 = 23
.Text3 = 9
.Text4 = 2.2
.Text5 = 180 'doubt
.Text6 = 0.46
.Text7 = 0.2  'check
.Text8 = 46
.Text9 = 2.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Size of each tyne, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of tynes"
.Text1 = " Cultivator"
.Text2 = 23
.Text3 = 9
.Text4 = 2.2
.Text5 = 180 'doubt
.Text6 = 0.46
.Text7 = 0.2  'check
.Text8 = 32
.Text9 = 1.9
.Text10 = 0
End With
End If
End If
If List2.Text = "11" Then
Label1.Visible = True
Label1.Caption = "11-tynes Cultivator"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Size of each tyne, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of tynes"
.Text1 = " Cultivator"
.Text2 = 23
.Text3 = 11
.Text4 = 2.66
.Text5 = 230 'doubt
.Text6 = 0.46
.Text7 = 0.2  'check
.Text8 = 46
.Text9 = 2.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Size of each tyne, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of tynes"
.Text1 = " Cultivator"
.Text2 = 23
.Text3 = 11
.Text4 = 2.66
.Text5 = 230 'doubt
.Text6 = 0.46
.Text7 = 0.2  'check
.Text8 = 32
.Text9 = 1.9
.Text10 = 0
End With
End If
End If
If List2.Text = "13" Then
Label1.Visible = True
Label1.Caption = "13-tynes Cultivator"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Size of each tyne, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of tynes"
.Text1 = " Cultivator"
.Text2 = 23
.Text3 = 13
.Text4 = 3.13
.Text5 = 280 'doubt
.Text6 = 0.46
.Text7 = 0.2  'check
.Text8 = 46
.Text9 = 2.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Size of each tyne, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of tynes"
.Text1 = " Cultivator"
.Text2 = 23
.Text3 = 13
.Text4 = 3.13
.Text5 = 280 'doubt
.Text6 = 0.46
.Text7 = 0.2  'check
.Text8 = 32
.Text9 = 1.9
.Text10 = 0
End With
End If
End If
End If

'disk harrow

If List1.Text = "Disc Harrow" Then
If List2.Text = "5 x 5" Then
Label1.Visible = True
Label1.Caption = "5 x 5 Offset Disc Harrow"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 10
.Text4 = 1.25
.Text5 = 200 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 364
.Text9 = 18.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 10
.Text4 = 1.25
.Text5 = 200 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 254
.Text9 = 13.2
.Text10 = 0
End With
End If
End If

If List2.Text = "6 x 6" Then
Label1.Visible = True
Label1.Caption = "6 x 6 Offset Disc Harrow"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 12
.Text4 = 1.4
.Text5 = 260 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 364
.Text9 = 18.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 12
.Text4 = 1.4
.Text5 = 260 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 254
.Text9 = 13.2
.Text10 = 0
End With
End If
End If
If List2.Text = "7 x 7" Then
Label1.Visible = True
Label1.Caption = "7 x 7 Offset Disc Harrow"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 14
.Text4 = 1.55
.Text5 = 280 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 364
.Text9 = 18.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 14
.Text4 = 1.55
.Text5 = 280 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 254
.Text9 = 13.2
.Text10 = 0
End With
End If
End If
If List2.Text = "8 x 8" Then
Label1.Visible = True
Label1.Caption = "8 x 8 Offset Disc Harrow"
If Option1.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 16
.Text4 = 1.7
.Text5 = 340 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 364
.Text9 = 18.8
.Text10 = 0
End With
End If
If Option2.Value = True Then
With Implement_specification
.Label2.Caption = ""
.Label2.Caption = "Diameter of each disc, cm"
.Label3.Caption = ""
.Label3.Caption = "Number of discs"
.Text1 = "Offset Disc Harrow"
.Text2 = 50
.Text3 = 16
.Text4 = 1.7
.Text5 = 340 'doubt
.Text6 = 0.65
.Text7 = 0#  'check
.Text8 = 254
.Text9 = 13.2
.Text10 = 0
End With
End If
End If
End If
End Sub

Private Sub Command3_Click()
If List3.Text = "" Then
MsgBox ("Click me after selecting tractor power range and make")
Else
If Option3 = True Then
If List3.Text = "Captain" Then
List4.Clear
List4.AddItem "DI 2600"
End If
If List3.Text = "Mitsubishi" Then
List4.Clear
List4.AddItem "MT 180 D"
End If
If List3.Text = "Eicher" Then '
List4.Clear
List4.AddItem "242 NC"
List4.AddItem "243 NC"
List4.AddItem "312 NC"
List4.AddItem "364 P"
End If
If List3.Text = "M & M" Then
List4.Clear
List4.AddItem "2515 DI"
List4.AddItem "255 DI"
List4.AddItem "B 275"
List4.AddItem "3015 DI"
List4.AddItem "3315 DI"
End If
If List3.Text = "PTL" Then
List4.Clear
List4.AddItem "724 FE"
List4.AddItem "725 FE"
List4.AddItem "726 FE"
List4.AddItem "722 Super"
List4.AddItem "733 FE"
End If
If List3.Text = "HMT" Then
List4.Clear
List4.AddItem "2522"
End If
If List3.Text = "TAFE" Then
List4.Clear
List4.AddItem "30 DI"
List4.AddItem "MF 1035"
List4.AddItem "MF 1035 S"
End If
If List3.Text = "Sonalika" Then
List4.Clear
List4.AddItem "DI 730"
List4.AddItem "DI 740"
End If

If List3.Text = "Bajaj Tempo" Then
List4.Clear
List4.AddItem "OX-25"
List4.AddItem "OX-35"
End If
If List3.Text = "Escort" Then
List4.Clear
List4.AddItem "430"
List4.AddItem "435"
List4.AddItem "Farmtrac 30"
List4.AddItem "Farmtrac 35"
End If
If List3.Text = "SAME Greaves" Then
List4.Clear
List4.AddItem "353"
End If
If List3.Text = "Indofarm" Then
List4.Clear
List4.AddItem "2040 DI"
End If
If List3.Text = "L&T John Deere" Then
List4.Clear
List4.AddItem "5103"
End If
End If


If Option4 = True Then
If List3.Text = "Eicher" Then
List4.Clear
List4.AddItem "368"
List4.AddItem "485"
List4.AddItem "586"
End If

If List3.Text = "Escort" Then
List4.Clear
List4.AddItem "440"
List4.AddItem "450"
List4.AddItem "440 XL"
List4.AddItem "450 XL"
List4.AddItem "Farmtrac 45"
List4.AddItem "Farmtrac 55"
End If

If List3.Text = "M & M" Then
List4.Clear
List4.AddItem "B 275 DI"
List4.AddItem "585 DI"
End If

If List3.Text = "HMT" Then
List4.Clear
List4.AddItem "4022"
List4.AddItem "4511"
List4.AddItem "3511"
End If

If List3.Text = "Bajaj Tempo" Then
List4.Clear
List4.AddItem "OX 45"
End If

If List3.Text = "TAFE" Then
List4.Clear
List4.AddItem "MF 245"
List4.AddItem "MF 241 DI J"
End If

If List3.Text = "PTL" Then
List4.Clear
List4.AddItem "735 FE"
List4.AddItem "744 FE"
List4.AddItem "855 FE"
End If

If List3.Text = "Sonalika" Then
List4.Clear
List4.AddItem "750 DI"
List4.AddItem "750 DI III"
End If

If List3.Text = "SAME Greaves" Then
List4.Clear
List4.AddItem "423"
List4.AddItem "503"
End If

If List3.Text = "Ford" Then
List4.Clear
List4.AddItem "3230"
List4.AddItem "3630"
End If
If List3.Text = "L&T John Deere" Then
List4.Clear
List4.AddItem "5203"
End If

If List3.Text = "Indofarm" Then
List4.Clear
List4.AddItem "2050 DI"
End If

End If


If Option5 = True Then
If List3.Text = "Eicher" Then
List4.Clear
List4.AddItem "6100"
End If

If List3.Text = "Escort" Then
List4.Clear
List4.AddItem "Farmtrac 70"
End If

If List3.Text = "M & M" Then
List4.Clear
List4.AddItem "605 DI"
End If

If List3.Text = "HMT" Then
List4.Clear
List4.AddItem "7511"
List4.AddItem "5911"
End If

If List3.Text = "TAFE" Then
List4.Clear
List4.AddItem "375 ET"
List4.AddItem "5900 GAJRAJ"
End If

If List3.Text = "L&T John Deere" Then
List4.Clear
List4.AddItem "5310"
End If

If List3.Text = "SAME Greaves" Then
List4.Clear
List4.AddItem "503 Syncropower"
End If

If List3.Text = "Ford" Then
List4.Clear
List4.AddItem "5630"
End If

If List3.Text = "Sonalika" Then
List4.Clear
List4.AddItem "DI 55"
End If

End If
End If

End Sub


Private Sub Command4_Click()
Dim length As Double
Dim width As Double
Dim area As Double
If Text1.Text = " " Then
MsgBox ("Enter length of field")
End If
If Text2.Text = " " Then
MsgBox ("Enter width of field")
Else
length = Text1.Text
width = Text2.Text
area = length * width / 10000
Text3.Text = area
Label7.Caption = "ha"
End If

End Sub

Private Sub Command5_Click()
Label11.Caption = " "
'Captain
If List3.Text = "Captain" Then
If List4.Text = "DI 2600" Then
Label11.Visible = True
Label11.Caption = " Captain DI 2600"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Captain"       ' Make
.Text3.Text = "DI 2600"       ' Model
.Text4.Text = 6.6             ' PTO Power
.Text5.Text = 2600            ' Rated engine speed
.Text6.Text = 25#              'Max Engine torque
.Text7.Text = 1.705            ' wheel base, m
.Text8.Text = 375           ' front static weight
.Text9.Text = 605           ' rear static weight
.Text10.Text = "5.2"              ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "14.0"
.Text13.Text = "8.0"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "18.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With
End If
End If
''''''''''''''''''''''''''''''''''''''''''''''''''''''''
 'Mitsubishi
If List3.Text = "Mitsubishi" Then
If List4.Text = "MT 180 D" Then
Label11.Visible = True
Label11.Caption = " Mitsubishi MT 180 D"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mitsubishi"       ' Make
.Text3.Text = "MT 180 D"       ' Model
.Text4.Text = "12.0"             ' PTO Power
.Text5.Text = 2700            ' Rated engine speed
.Text6.Text = 45.5             'Max Engine torque
.Text7.Text = 1.42           ' wheel base, m
.Text8.Text = 315            ' front static weight
.Text9.Text = 440          ' rear static weight
.Text10.Text = "5.0"              ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "12.0"
.Text13.Text = "8.0"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "18.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
End If
'''''''''''''''''''''''''''''''''''''''''''''''''''''''
 'Eicher
If List3.Text = "Eicher" Then
If List4.Text = "242 NC" Then
Label11.Visible = True
Label11.Caption = " Eicher 242 NC"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "242 NC"       ' Model
.Text4.Text = "14.8"             ' PTO Power
.Text5.Text = 1650           ' Rated engine speed
.Text6.Text = 96.9             'Max Engine torque
.Text7.Text = 1.881          ' wheel base, m
.Text8.Text = 680            ' front static weight
.Text9.Text = 1070           ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With
End If
If List4.Text = "243 NC" Then
Label11.Visible = True
Label11.Caption = " Eicher 243 NC"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "243 NC"       ' Model
.Text4.Text = "14.4"             ' PTO Power
.Text5.Text = 1650           ' Rated engine speed
.Text6.Text = 91.3            'Max Engine torque
.Text7.Text = 1.87           ' wheel base, m
.Text8.Text = 655             ' front static weight
.Text9.Text = 1080          ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With
End If
If List4.Text = "312 NC" Then
Label11.Visible = True
Label11.Caption = " Eicher 312 NC"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "312 NC"       ' Model
.Text4.Text = "20.7"             ' PTO Power
.Text5.Text = 2150          ' Rated engine speed
.Text6.Text = 93.1             'Max Engine torque
.Text7.Text = 1.888           ' wheel base, m
.Text8.Text = 645             ' front static weight
.Text9.Text = 1090          ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With
End If

If List4.Text = "364 P" Then
Label11.Visible = True
Label11.Caption = " Eicher 364 P"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "364 P"       ' Model
.Text4.Text = "22.7"             ' PTO Power
.Text5.Text = 2150          ' Rated engine speed
.Text6.Text = 117#              'Max Engine torque
.Text7.Text = 1.9             ' wheel base, m
.Text8.Text = 645             ' front static weight
.Text9.Text = 1235         ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
 
If List4.Text = "368" Then
Label11.Visible = True
Label11.Caption = " Eicher 368"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "368"       ' Model
.Text4.Text = "25.0"             ' PTO Power, kW
.Text5.Text = 2150          ' Rated engine speed
.Text6.Text = 132.5             'Max Engine torque, N-m
.Text7.Text = 1.985            ' wheel base, m
.Text8.Text = 720             ' front static weight
.Text9.Text = 1100         ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With
End If
 
If List4.Text = "485" Then
Label11.Visible = True
Label11.Caption = " Eicher 485"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "485"       ' Model
.Text4.Text = "28.7"       ' PTO Power
.Text5.Text = 2150         ' Rated engine speed
.Text6.Text = 148.7             'Max Engine torque
.Text7.Text = 2.07            ' wheel base, m
.Text8.Text = 695           ' front static weight
.Text9.Text = 1205         ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
 
If List4.Text = "586" Then
Label11.Visible = True
Label11.Caption = " Eicher 586"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "586"       ' Model
.Text4.Text = "33.9"             ' PTO Power
.Text5.Text = 2150          ' Rated engine speed
.Text6.Text = 179.6             'Max Engine torque
.Text7.Text = 2.095             ' wheel base, m
.Text8.Text = 825            ' front static weight
.Text9.Text = 1485         ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle

End With

End If

If List4.Text = "6100" Then
Label11.Visible = True
Label11.Caption = " Eicher 6100"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Eicher"       ' Make
.Text3.Text = "6100"       ' Model
.Text4.Text = "40.2"             ' PTO Power
.Text5.Text = 1250           ' Rated engine speed
.Text6.Text = 207.9             'Max Engine torque
.Text7.Text = 2.115               ' wheel base, m
.Text8.Text = 1315            ' front static weight
.Text9.Text = 1550          ' rear static weight
.Text10.Text = "7.5"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "16.9"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "30.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

End If
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'M&M
If List3.Text = "M & M" Then
If List4.Text = "2515 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra 2515 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "2515 DI"       ' Model
.Text4.Text = "17.2"             ' PTO Power, kW
.Text5.Text = 2600           ' Rated engine speed, rpm
.Text6.Text = 70.4             'Max Engine torque, N-m
.Text7.Text = 1.746                ' wheel base, m
.Text8.Text = 655             ' front static weight
.Text9.Text = 875          ' rear static weight
.Text10.Text = "5.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "15.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "24.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "255 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra  255 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "255 DI"       ' Model
.Text4.Text = "16.1"             ' PTO Power, kW
.Text5.Text = 2600           ' Rated engine speed, rpm
.Text6.Text = 68.6             'Max Engine torque, N-m
.Text7.Text = 1.83                ' wheel base, m
.Text8.Text = 635             ' front static weight
.Text9.Text = 1110           ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "B 275" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra B 275"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "B 275"       ' Model
.Text4.Text = "20.0"             ' PTO Power, kW
.Text5.Text = 1900          ' Rated engine speed, rpm
.Text6.Text = 104#              'Max Engine torque, N-m
.Text7.Text = 1.927                 ' wheel base, m
.Text8.Text = 670            ' front static weight
.Text9.Text = 1110           ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "3015 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra 3015 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "3015 DI"       ' Model
.Text4.Text = "19.1"             ' PTO Power, kW
.Text5.Text = 2300          ' Rated engine speed, rpm
.Text6.Text = 86.4               'Max Engine torque, N-m
.Text7.Text = 1.755                 ' wheel base, m
.Text8.Text = 670            ' front static weight
.Text9.Text = 1110           ' rear static weight
.Text10.Text = "5.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "15.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "24.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With
End If

If List4.Text = "3315 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra  3315 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "3315 DI"       ' Model
.Text4.Text = "22.3"             ' PTO Power, kW
.Text5.Text = 2300          ' Rated engine speed, rpm
.Text6.Text = 99.9              'Max Engine torque, N-m
.Text7.Text = 1.74                ' wheel base, m
.Text8.Text = 670            ' front static weight
.Text9.Text = 905           ' rear static weight
.Text10.Text = "5.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "15.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "24.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "B 275 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra B 275 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "B 275 DI"       ' Model
.Text4.Text = "25.5"             ' PTO Power, kW
.Text5.Text = 2600         ' Rated engine speed, rpm
.Text6.Text = 105.2              'Max Engine torque, N-m
.Text7.Text = 1.83                ' wheel base, m
.Text8.Text = 710            ' front static weight
.Text9.Text = 1080            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
If List4.Text = "585 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra 585 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "585 DI"       ' Model
.Text4.Text = "31.8"             ' PTO Power, kW
.Text5.Text = 2600         ' Rated engine speed, rpm
.Text6.Text = 129.8              'Max Engine torque, N-m
.Text7.Text = 1.92                ' wheel base, m
.Text8.Text = 710            ' front static weight
.Text9.Text = 1080            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "605 DI" Then
Label11.Visible = True
Label11.Caption = " Mahindra & Mahindra 605 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Mahindra & Mahindra"       ' Make
.Text3.Text = "605 DI"       ' Model
.Text4.Text = "37.8"             ' PTO Power, kW
.Text5.Text = 2100          ' Rated engine speed, rpm
.Text6.Text = 203#               'Max Engine torque, N-m
.Text7.Text = 2.14                 ' wheel base, m
.Text8.Text = 905            ' front static weight
.Text9.Text = 1415            ' rear static weight
.Text10.Text = "7.5"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "16.9"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
End If

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'PTL
If List3.Text = "PTL" Then
If List4.Text = "724 FE" Then
Label11.Visible = True
Label11.Caption = " SWARAJ 724 FE"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "724 FE"       ' Model
.Text4.Text = "16.2"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 96.6              'Max Engine torque, N-m
.Text7.Text = 1.92                 ' wheel base, m
.Text8.Text = 630           ' front static weight
.Text9.Text = 1085            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "725 FE" Then
Label11.Visible = True
Label11.Caption = " SWARAJ 725 FE"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "725 FE"       ' Model
.Text4.Text = "16.6"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 92.1              'Max Engine torque, N-m
.Text7.Text = 1.715                 ' wheel base, m
.Text8.Text = 670         ' front static weight
.Text9.Text = 1055            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "726 FE" Then
Label11.Visible = True
Label11.Caption = " SWARAJ 726 FE"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "726 FE"       ' Model
.Text4.Text = "15.9"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 89.6              'Max Engine torque, N-m
.Text7.Text = 1.917                 ' wheel base, m
.Text8.Text = 610           ' front static weight
.Text9.Text = 1090            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "722 Super" Then
Label11.Visible = True
Label11.Caption = " SWARAJ 722 Super"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "722 Super"       ' Model
.Text4.Text = "13.6"             ' PTO Power, kW
.Text5.Text = 1900          ' Rated engine speed, rpm
.Text6.Text = 78.2              'Max Engine torque, N-m
.Text7.Text = 1.81                 ' wheel base, m
.Text8.Text = 700          ' front static weight
.Text9.Text = 1060             ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "733 FE" Then
Label11.Visible = True
Label11.Caption = " SWARAJ 733 FE"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "733 FE"       ' Model
.Text4.Text = "21.0"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 119.9              'Max Engine torque, N-m
.Text7.Text = 1.92                ' wheel base, m
.Text8.Text = 650         ' front static weight
.Text9.Text = 1100           ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "735 FE" Then
Label11.Visible = True
Label11.Caption = "SWARAJ 735 FE"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "735 FE"       ' Model
.Text4.Text = "25.3"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 139.3              'Max Engine torque, N-m
.Text7.Text = 1.955                  ' wheel base, m
.Text8.Text = 675          ' front static weight
.Text9.Text = 1110           ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If

If List4.Text = "744 FE" Then
Label11.Visible = True
Label11.Caption = "SWARAJ 744 FE"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "744 FE"       ' Model
.Text4.Text = "30.4"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 165.6              'Max Engine torque, N-m
.Text7.Text = 1.955                  ' wheel base, m
.Text8.Text = 750           ' front static weight
.Text9.Text = 1180            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
If List4.Text = "855 FE" Then
Label11.Visible = True
Label11.Caption = "SWARAJ 855"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SWARAJ"       ' Make
.Text3.Text = "855 FE"       ' Model
.Text4.Text = "33.0"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 181.7              'Max Engine torque, N-m
.Text7.Text = 1.95                   ' wheel base, m
.Text8.Text = 755           ' front static weight
.Text9.Text = 1160            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
End If
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'HMT
If List3.Text = "HMT" Then
If List4.Text = "2522" Then
Label11.Visible = True
Label11.Caption = "HMT 2522"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "HMT"       ' Make
.Text3.Text = "2522"       ' Model
.Text4.Text = "15.6"             ' PTO Power, kW
.Text5.Text = 2100          ' Rated engine speed, rpm
.Text6.Text = 83.9              'Max Engine torque, N-m
.Text7.Text = 1.485                      ' wheel base, m
.Text8.Text = 540          ' front static weight
.Text9.Text = 920             ' rear static weight
.Text10.Text = "5.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "15.0"
.Text13.Text = "8.0"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "18.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
If List4.Text = "4022" Then
Label11.Visible = True
Label11.Caption = " HMT 4022"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "HMT"       ' Make
.Text3.Text = "4022"       ' Model
.Text4.Text = "27.4"             ' PTO Power, kW
.Text5.Text = 2100          ' Rated engine speed, rpm
.Text6.Text = 141.8              'Max Engine torque, N-m
.Text7.Text = 2.01                       ' wheel base, m
.Text8.Text = 730          ' front static weight
.Text9.Text = 1230             ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away rear axle
End With

End If
If List4.Text = "4511" Then
Label11.Visible = True
Label11.Caption = " HMT 4511"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "HMT"       ' Make
.Text3.Text = "4511"       ' Model
.Text4.Text = "30.1"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 145.1              'Max Engine torque, N-m
.Text7.Text = 2.017                 ' wheel base, m
.Text8.Text = 770        ' front static weight
.Text9.Text = 1250               ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If
If List4.Text = "3511" Then
Label11.Visible = True
Label11.Caption = " HMT 3511"


With Tractor_specification
.Text1.Text = "2WD"                    'Drive mode
.Text2.Text = "HMT"                  ' Make
.Text3.Text = 3511                     ' Model
.Text4.Text = 23.6                       ' PTO Power, kW
.Text5.Text = 2000                       ' Rated engine speed, rpm
.Text6.Text = 282                           'Max Engine torque, N-m
.Text7.Text = 2.02               ' wheel base, m
.Text8.Text = 690        ' front static weight
.Text9.Text = 1160             ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "5911" Then
Label11.Visible = True
Label11.Caption = " HMT 5911"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "HMT"       ' Make
.Text3.Text = "5911"       ' Model
.Text4.Text = "38.9"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 191.5              'Max Engine torque, N-m
.Text7.Text = 2.257                ' wheel base, m
.Text8.Text = 860       ' front static weight
.Text9.Text = 1555             ' rear static weight
.Text10.Text = "6.5"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "20.0"
.Text13.Text = "16.9"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If
If List4.Text = "7511" Then
Label11.Visible = True
Label11.Caption = " HMT 7511"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "HMT"       ' Make
.Text3.Text = "7511"       ' Model
.Text4.Text = "47.6"             ' PTO Power, kW
.Text5.Text = 2200         ' Rated engine speed, rpm
.Text6.Text = 265.4             'Max Engine torque, N-m
.Text7.Text = 2.35            ' wheel base, m
.Text8.Text = 1250      ' front static weight
.Text9.Text = 2050             ' rear static weight
.Text10.Text = "6.5"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "20.0"
.Text13.Text = "18.4"       ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "30.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If
End If
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

'Escort
If List3.Text = "Escort" Then
If List4.Text = "430" Then
Label11.Visible = True
Label11.Caption = " Escort 430"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "430"       ' Model
.Text4.Text = "20.6"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 99.2              'Max Engine torque, N-m
.Text7.Text = 1.927          ' wheel base, m
.Text8.Text = 670     ' front static weight
.Text9.Text = 1110            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "435" Then
Label11.Visible = True
Label11.Caption = " Escort 435"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "435"       ' Model
.Text4.Text = "23.6"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 116.9              'Max Engine torque, N-m
.Text7.Text = 1.925          ' wheel base, m
.Text8.Text = 675    ' front static weight
.Text9.Text = 1110            ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "Farmtrac 30" Then
Label11.Visible = True
Label11.Caption = "Escort's Farmtrac 30 "
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "Farmtrac 30"       ' Model
.Text4.Text = "20.7"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 101.5              'Max Engine torque, N-m
.Text7.Text = 1.87         ' wheel base, m
.Text8.Text = 680     ' front static weight
.Text9.Text = 1180          ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With
End If

If List4.Text = "Farmtrac 35" Then
Label11.Visible = True
Label11.Caption = " Escort's Farmtrac 35"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "Farmtrac 35"       ' Model
.Text4.Text = "24.3"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 124.5              'Max Engine torque, N-m
.Text7.Text = 1.875        ' wheel base, m
.Text8.Text = 705     ' front static weight
.Text9.Text = 1160         ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "440" Then
Label11.Visible = True
Label11.Caption = " Escort 440"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "440"       ' Model
.Text4.Text = "27.5"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 136#               'Max Engine torque, N-m
.Text7.Text = 2#          ' wheel base, m
.Text8.Text = 740     ' front static weight
.Text9.Text = 1160        ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "450" Then
Label11.Visible = True
Label11.Caption = " Escort 450"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "450"       ' Model
.Text4.Text = "31.2"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 159.3              'Max Engine torque, N-m
.Text7.Text = 1.965         ' wheel base, m
.Text8.Text = 710    ' front static weight
.Text9.Text = 1170        ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "440 XL" Then
Label11.Visible = True
Label11.Caption = " Escort 440 XL"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "440 XL (Powertrac)"       ' Model
.Text4.Text = "29.2"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 145.9              'Max Engine torque, N-m
.Text7.Text = 2.02        ' wheel base, m
.Text8.Text = 730    ' front static weight
.Text9.Text = 1275       ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "450 XL" Then
Label11.Visible = True
Label11.Caption = " Escort 450 XL"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "450 XL (Powertrac)"       ' Model
.Text4.Text = "32.0"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 155.2              'Max Engine torque, N-m
.Text7.Text = 2.005         ' wheel base, m
.Text8.Text = 730    ' front static weight
.Text9.Text = 1250        ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "Farmtrac 45" Then
Label11.Visible = True
Label11.Caption = "Escort's Farmtrac 45 "
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "Farmtrac 45"       ' Model
.Text4.Text = "27.1"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 144.1              'Max Engine torque, N-m
.Text7.Text = 1.944        ' wheel base, m
.Text8.Text = 760     ' front static weight
.Text9.Text = 1085        ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "Farmtrac 55" Then
Label11.Visible = True
Label11.Caption = " Escort's Farmtrac 55"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "Farmtrac 55"       ' Model
.Text4.Text = "30.5"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 157.4              'Max Engine torque, N-m
.Text7.Text = 1.935       ' wheel base, m
.Text8.Text = 755     ' front static weight
.Text9.Text = 1160        ' rear static weight
.Text10.Text = "6.0"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "Farmtrac 70" Then
Label11.Visible = True
Label11.Caption = " Escort's Farmtrac 70"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Escort"       ' Make
.Text3.Text = "Farmtrac 70"       ' Model
.Text4.Text = "38.4"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 195.6              'Max Engine torque, N-m
.Text7.Text = 2.12       ' wheel base, m
.Text8.Text = 910      ' front static weight
.Text9.Text = 1460     ' rear static weight
.Text10.Text = "7.5"           ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "16.9"       ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "30.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If

''''''''''''''''''''''''''''''''''''''''''''''''''''''

'sonalika
If List3.Text = "Sonalika" Then
If List4.Text = "DI 730" Then
Label11.Visible = True
Label11.Caption = " SONALIKA DI 730"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Sonalika"       ' Make
.Text3.Text = "International DI 730"       ' Model
.Text4.Text = "18.2"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 95.8              'Max Engine torque, N-m
.Text7.Text = 1.905       ' wheel base, m
.Text8.Text = 770      ' front static weight
.Text9.Text = 1090     ' rear static weight
.Text10.Text = "6.0"          ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "DI 740" Then
Label11.Visible = True
Label11.Caption = " SONALIKA DI 740"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Sonalika"       ' Make
.Text3.Text = "International DI 740"       ' Model
.Text4.Text = "23.7"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 129.8              'Max Engine torque, N-m
.Text7.Text = 1.985        ' wheel base, m
.Text8.Text = 720      ' front static weight
.Text9.Text = 1100     ' rear static weight
.Text10.Text = "6.0"          ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "750 DI" Then
Label11.Visible = True
Label11.Caption = " SONALIKA DI 750"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Sonalika"       ' Make
.Text3.Text = "International DI 750"       ' Model
.Text4.Text = "28.9"             ' PTO Power, kW
.Text5.Text = 2250          ' Rated engine speed, rpm
.Text6.Text = 140.6            'Max Engine torque, N-m
.Text7.Text = 1.94         ' wheel base, m
.Text8.Text = 790       ' front static weight
.Text9.Text = 1180     ' rear static weight
.Text10.Text = "6.0"          ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "750 DI III" Then
Label11.Visible = True
Label11.Caption = "SONALIKA DI 750  III"

With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Sonalika"       ' Make
.Text3.Text = "International DI 750 III"       ' Model
.Text4.Text = "31.3"             ' PTO Power, kW
.Text5.Text = 2100          ' Rated engine speed, rpm
.Text6.Text = 155.9            'Max Engine torque, N-m
.Text7.Text = 2.065        ' wheel base, m
.Text8.Text = 925    ' front static weight
.Text9.Text = 1205     ' rear static weight
.Text10.Text = "6.0"          ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "DI 55" Then
Label11.Visible = True
Label11.Caption = " SONALIKA DI 55"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Sonalika"       ' Make
.Text3.Text = "International DI 55"       ' Model
.Text4.Text = "36.6"             ' PTO Power, kW
.Text5.Text = 2100          ' Rated engine speed, rpm
.Text6.Text = 185.5            'Max Engine torque, N-m
.Text7.Text = 2.085         ' wheel base, m
.Text8.Text = 930   ' front static weight
.Text9.Text = 1205     ' rear static weight
.Text10.Text = "6.0"          ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If

''''''''''''''''''''''''''''''''''''''''''''''''''''
'Bajaj Tempo
If List3.Text = "Bajaj Tempo" Then
If List4.Text = "OX-25" Then
Label11.Visible = True
Label11.Caption = "BAJAJ TEMPO OX-25"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Tempo"       ' Make
.Text3.Text = "OX-25"       ' Model
.Text4.Text = "18.2"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 93.8            'Max Engine torque, N-m
.Text7.Text = 1.585         ' wheel base, m
.Text8.Text = 930   ' front static weight
.Text9.Text = 1205     ' rear static weight
.Text10.Text = "5.5"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "11.2"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

'If List3.Text = "Bajaj Tempo" Then
If List4.Text = "OX-35" Then
Label11.Visible = True
Label11.Caption = "BAJAJ TEMPO OX-35"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Bajaj Tempo"       ' Make
.Text3.Text = "OX-35"       ' Model
.Text4.Text = "23.9"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 113.7            'Max Engine torque, N-m
.Text7.Text = 1.93         ' wheel base, m
.Text8.Text = 930   ' front static weight
.Text9.Text = 1205     ' rear static weight
.Text10.Text = "6.0"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "OX 45" Then
Label11.Visible = True
Label11.Caption = "BAJAJ TEMPO OX 45"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Tempo"       ' Make
.Text3.Text = "OX-45"       ' Model
.Text4.Text = "31.5"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 147.8            'Max Engine torque, N-m
.Text7.Text = 1.96         ' wheel base, m
.Text8.Text = 730   ' front static weight
.Text9.Text = 1120     ' rear static weight
.Text10.Text = "6.0"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If
''''''''''''''''''''''''''''''''''''''''''''''''''''''
'Ford

If List3.Text = "Ford" Then
If List4.Text = "3230" Then
Label11.Visible = True
Label11.Caption = "FORD 3230"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "New Holland"       ' Make
.Text3.Text = "3230"       ' Model
.Text4.Text = "28.6"             ' PTO Power, kW
.Text5.Text = 2000          ' Rated engine speed, rpm
.Text6.Text = 158.6            'Max Engine torque, N-m
.Text7.Text = 1.91         ' wheel base, m
.Text8.Text = 680  ' front static weight
.Text9.Text = 1000    ' rear static weight
.Text10.Text = "6.0"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "3630" Then
Label11.Visible = True
Label11.Caption = "FORD 3630"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Ford"       ' Make
.Text3.Text = "3630"       ' Model
.Text4.Text = "33.8"             ' PTO Power, kW
.Text5.Text = 2500          ' Rated engine speed, rpm
.Text6.Text = 141.7            'Max Engine torque, N-m
.Text7.Text = 2.065              ' wheel base, m
.Text8.Text = 840  ' front static weight
.Text9.Text = 1250 ' rear static weight
.Text10.Text = "6.0"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "5630" Then
Label11.Visible = True
Label11.Caption = "FORD 5630"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Ford"       ' Make
.Text3.Text = "5630"       ' Model
.Text4.Text = "43.4"             ' PTO Power, kW
.Text5.Text = 2500          ' Rated engine speed, rpm
.Text6.Text = 195.2            'Max Engine torque, N-m
.Text7.Text = 2.165              ' wheel base, m
.Text8.Text = 1190 ' front static weight
.Text9.Text = 1810 ' rear static weight
.Text10.Text = "7.5"          ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "18.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "30.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If

'''''''''''''''''''''''''''''''''''''''''''''''''''''
'John Deere
If List3.Text = "L&T John Deere" Then
If List4.Text = "5103" Then
Label11.Visible = True
Label11.Caption = "L& T John Deere 5103"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "L&T John Deere"       ' Make
.Text3.Text = "5103"       ' Model
.Text4.Text = "24.4"             ' PTO Power, kW
.Text5.Text = 2300          ' Rated engine speed, rpm
.Text6.Text = 139.2            'Max Engine torque, N-m
.Text7.Text = 1.95               ' wheel base, m
.Text8.Text = 675 ' front static weight
.Text9.Text = 1120 ' rear static weight
.Text10.Text = "6.0"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "5203" Then
Label11.Visible = True
Label11.Caption = "L& T John Deere 5203"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "L&T John Deere"       ' Make
.Text3.Text = "5203"       ' Model
.Text4.Text = "32.5"             ' PTO Power, kW
.Text5.Text = 2300          ' Rated engine speed, rpm
.Text6.Text = 165#             'Max Engine torque, N-m
.Text7.Text = 1.945                ' wheel base, m
.Text8.Text = 675 ' front static weight
.Text9.Text = 1170 ' rear static weight
.Text10.Text = "6.0"         ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"        ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "5310" Then
Label11.Visible = True
Label11.Caption = "L& T John Deere 5310"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "L& T John Deere"       ' Make
.Text3.Text = "5310"       ' Model
.Text4.Text = "37.4"             ' PTO Power, kW
.Text5.Text = 2400          ' Rated engine speed, rpm
.Text6.Text = 178           'Max Engine torque, N-m
.Text7.Text = 2.05                 ' wheel base, m
.Text8.Text = 755 ' front static weight
.Text9.Text = 1400 ' rear static weight
.Text10.Text = "6.5"           ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "20.0"
.Text13.Text = "16.9"         ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If
End If

''''''''''''''''''''''''''''''''''''''''''''''
'Same Greaves
If List3.Text = "SAME Greaves" Then
If List4.Text = "353" Then
Label11.Visible = True
Label11.Caption = "SAME Greaves 353"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SAME Greaves"       ' Make
.Text3.Text = "353"       ' Model
.Text4.Text = "22.4"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 140           'Max Engine torque, N-m
.Text7.Text = 2.05                 ' wheel base, m
.Text8.Text = 770 ' front static weight
.Text9.Text = 1110 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "423" Then
Label11.Visible = True
Label11.Caption = "SAME Greaves 423"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SAME Greaves"       ' Make
.Text3.Text = "423"       ' Model
.Text4.Text = "28.7"             ' PTO Power, kW
.Text5.Text = 2200          ' Rated engine speed, rpm
.Text6.Text = 149.5           'Max Engine torque, N-m
.Text7.Text = 2.05                 ' wheel base, m
.Text8.Text = 745 ' front static weight
.Text9.Text = 1120 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "503" Then
Label11.Visible = True
Label11.Caption = "SAME Greaves 503"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SAME Greaves"       ' Make
.Text3.Text = "503"       ' Model
.Text4.Text = "32.0"             ' PTO Power, kW
.Text5.Text = 2350          ' Rated engine speed, rpm
.Text6.Text = 166.6           'Max Engine torque, N-m
.Text7.Text = 2.045                  ' wheel base, m
.Text8.Text = 775  ' front static weight
.Text9.Text = 1165 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "503 Syncropower" Then
Label11.Visible = True
Label11.Caption = "SAME Greaves 503 Syncropower"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "SAME Greaves"       ' Make
.Text3.Text = "503 Synchropower"       ' Model
.Text4.Text = "36.5"             ' PTO Power, kW
.Text5.Text = 2350          ' Rated engine speed, rpm
.Text6.Text = 180.3           'Max Engine torque, N-m
.Text7.Text = 2.045                  ' wheel base, m
.Text8.Text = 775  ' front static weight
.Text9.Text = 1165 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If
''''''''''''''''''''''''''''''''''''''''''

If List3.Text = "Indofarm" Then
If List4.Text = "2040 DI" Then
Label11.Visible = True
Label11.Caption = "Indofarm 2040 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Indofarm"       ' Make
.Text3.Text = "2040 DI"       ' Model
.Text4.Text = "24.5"             ' PTO Power, kW
.Text5.Text = 2000         ' Rated engine speed, rpm
.Text6.Text = 143.5         'Max Engine torque, N-m
.Text7.Text = 1.95                  ' wheel base, m
.Text8.Text = 850  ' front static weight
.Text9.Text = 1140 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"             ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "2050 DI" Then
Label11.Visible = True
Label11.Caption = "Indofarm 2050 DI"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "Indofarm"       ' Make
.Text3.Text = "2040 DI"       ' Model
.Text4.Text = "31.6"             ' PTO Power, kW
.Text5.Text = 2250         ' Rated engine speed, rpm
.Text6.Text = 155.2         'Max Engine torque, N-m
.Text7.Text = 1.94                  ' wheel base, m
.Text8.Text = 770 ' front static weight
.Text9.Text = 1180 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"             ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If
'''''''''''''''''''''''''''''''''''''''''''''
'TAFE
If List3.Text = "TAFE" Then
If List4.Text = "30 DI" Then
Label11.Visible = True
Label11.Caption = "TAFE 30 DI J"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "30 DI(J)"       ' Model
.Text4.Text = "19.5"             ' PTO Power, kW
.Text5.Text = 2250         ' Rated engine speed, rpm
.Text6.Text = 91.7         'Max Engine torque, N-m
.Text7.Text = 1.715                  ' wheel base, m
.Text8.Text = 700 ' front static weight
.Text9.Text = 970 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "MF 1035" Then
Label11.Visible = True
Label11.Caption = " TAFE's MF 1035"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "MF 1035"       ' Model
.Text4.Text = "21.6"             ' PTO Power, kW
.Text5.Text = 2000        ' Rated engine speed, rpm
.Text6.Text = 120.3        'Max Engine torque, N-m
.Text7.Text = 1.82                   ' wheel base, m
.Text8.Text = 605 ' front static weight
.Text9.Text = 875 ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "MF 1035 S" Then
Label11.Visible = True
Label11.Caption = " TAFE's MF 1035 S"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "MF 1035 S"       ' Model
.Text4.Text = "20.9"             ' PTO Power, kW
.Text5.Text = 2000        ' Rated engine speed, rpm
.Text6.Text = 116.4         'Max Engine torque, N-m
.Text7.Text = 1.815                  ' wheel base, m
.Text8.Text = 635  ' front static weight
.Text9.Text = 930  ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"            ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "MF 245" Then
Label11.Visible = True
Label11.Caption = " TAFE's MF 245"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "MF 245"       ' Model
.Text4.Text = "30.2"             ' PTO Power, kW
.Text5.Text = 2250        ' Rated engine speed, rpm
.Text6.Text = 157.8         'Max Engine torque, N-m
.Text7.Text = 1.814                  ' wheel base, m
.Text8.Text = 655   ' front static weight
.Text9.Text = 1040  ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "13.6"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "MF 241 DI J" Then
Label11.Visible = True
Label11.Caption = " TAFE's MF 241 DI (J)"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "MF 241 DI (J)"       ' Model
.Text4.Text = "28.3"             ' PTO Power, kW
.Text5.Text = 2000        ' Rated engine speed, rpm
.Text6.Text = 156         'Max Engine torque, N-m
.Text7.Text = 1.82                   ' wheel base, m
.Text8.Text = 680    ' front static weight
.Text9.Text = 1020   ' rear static weight
.Text10.Text = "6.0"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "12.4"           ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "375 ET" Then
Label11.Visible = True
Label11.Caption = " TAFE 375 ET"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "375 ET"       ' Model
.Text4.Text = "55.5"             ' PTO Power, kW
.Text5.Text = 2200        ' Rated engine speed, rpm
.Text6.Text = 264.9         'Max Engine torque, N-m
.Text7.Text = 2.232                   ' wheel base, m
.Text8.Text = 1020    ' front static weight
.Text9.Text = 1505   ' rear static weight
.Text10.Text = "7.5"            ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "16.0"
.Text13.Text = "18.4"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "30.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

If List4.Text = "5900 GAJRAJ" Then
Label11.Visible = True
Label11.Caption = " TAFE 5900 GAJRAJ"
With Tractor_specification
.Text1.Text = "2WD"           'Drive mode
.Text2.Text = "TAFE"       ' Make
.Text3.Text = "5900 GAJRAJ"       ' Model
.Text4.Text = "38"             ' PTO Power, kW
.Text5.Text = 2300        ' Rated engine speed, rpm
.Text6.Text = 184.9         'Max Engine torque, N-m
.Text7.Text = 2.05                  ' wheel base, m
.Text8.Text = 785   ' front static weight
.Text9.Text = 1395   ' rear static weight
.Text10.Text = "6.5"             ' front tire size  text 10-12
.Text11.Text = "-"
.Text12.Text = "20.0"
.Text13.Text = "16.9"          ' rear tire size  text 13-15
.Text14.Text = "-"
.Text15.Text = "28.0"
.Text18.Text = 0.72         ' Hitch point away from rear axle
End With

End If

End If


Ppto = Val(Tractor_specification.Text4.Text)  ' PTO Power, kW
rpm = Val(Tractor_specification.Text5.Text)   ' Rated engine speed, rpm
Torque_max = Val(Tractor_specification.Text6.Text)  ' max toque, Nm
Wb = Val(Tractor_specification.Text7.Text) ' wheel base, m
Fs = Val(Tractor_specification.Text8.Text)   ' front static weight, kg
Rs = Val(Tractor_specification.Text9.Text) ' rear static weight, kg
bwf = Val(Tractor_specification.Text10.Text) 'nominal section width of front tire, inch
dwf = Val(Tractor_specification.Text12.Text) 'nominal rim diameter of front tire, inch
bwr = Val(Tractor_specification.Text13.Text) 'nominal section width of rear tire, inch
dwr = Val(Tractor_specification.Text15.Text) 'nominal rim diameter of front tire, inch
Hd = Val(Tractor_specification.Text18.Text) ' Hitch point away from rear axle, m


TW = Fs + Rs           ' tractor weight, total kg
CGd = Fs * Wb / TW    ' CG away from rear axle, m
ODf = (1.5 * bwf + 1.06 * dwf) * 0.0254        ' Overall diameter front wheel, m
ODr = (1.5 * bwr + 1.06 * dwr) * 0.0254        ' Overall diameter rear wheel, m
Slrf = ODf / 2 - (0.2 * 0.75 * 0.0254 * bwf)   ' static loaded radius front, m
Slrr = ODr / 2 - (0.2 * 0.75 * 0.0254 * bwr)   ' static loaded radius rear, m
rf = (2.5 * ODf * Slrf / 2) / ((1.5 * ODf / 2) + Slrf)  ' rolling radius front wheel, m
rr = (2.5 * ODr * Slrr / 2) / ((1.5 * ODr / 2) + Slrr)  ' rolling radius rear wheel, m
With Tractor_specification
.Text16.Text = Format(TW, "  .00")
.Text17.Text = Format(CGd, "  .00")
.Text19.Text = Format(rf, "  .00")
.Text20.Text = Format(rr, "  .00")
End With
With Tire_specification
.Text1.Text = Format(bwf, " 0.0")
.Text2.Text = Format(dwf, " 0.0")
.Text3.Text = Format(bwr, " 0.0")
.Text4.Text = Format(dwr, " 0.0")
.Text5.Text = Format(ODf * 1000, " 0.00")
.Text11.Text = Format(ODr * 1000, " 0.00")
.Text6.Text = Format(bwf * 25.4, " 0.00")
.Text12.Text = Format(bwr * 25.4, " 0.00")
.Text7.Text = Format(Slrf * 1000, " 0.00")
.Text13.Text = Format(Slrr * 1000, " 0.00")
.Text8.Text = Format(rf * 1000, " 0.00")
.Text14.Text = Format(rr * 1000, " 0.00")
End With

End Sub

Private Sub Command6_Click()

Dim Prated, Ppto, Paxle, Pdb, Pull_engine, Pused, rpm, Torque, rpm_maxtorque, Wb, CGh, CGd, TW, Rs, Rd, Fs, Fd, _
A, B, C, Fi, Draft, CI, width, speed, depth, COTMax, FC_th, FC_ac, Field_eff, area, time, _
Hd, Wm, CGm, ratio_force, ODf, ODr, SWf, SWr, Slrf, Slrr, slip, RRr1, RRf1, ef, er, r1, r2, deflection_ratio, Py, TE, MR, NT1, NT2, GT, Bnr, Bnf, Pull, Kwf, Kwr As Double
Dim Temp1, Temp2, Temp3, Temp4, Temp5, Temp6, Temp7, RRr2, RRf2, Pull_st, Pkw1 As Double
Dim rf, rr As Double
Dim trans_eff, Pow_res, Pow_av As Double
Dim RFWD, BALLAST_F, Rd3, Bnr3, RRr3, slip3, GT3, TE3, NT3, BALLAST_R As Double
       
' Fi value in ASAE Draft model and field efficiency
If List1.Text = "MB Plough" Then

If Option6 = True Then
Fi = 1#
End If
If Option7 = True Then
Fi = 0.45
End If
If Option8 = True Then
Fi = 0.7
End If
End If
 
If List1.Text = "Disc Plough" Then
If Option6 = True Then
Fi = "1.0"
End If
If Option7 = True Then
Fi = 0.78
End If
If Option8 = True Then
Fi = 0.88
End If
End If

If List1.Text = "Disc Harrow" Then
If Option6 = True Then
Fi = 1#
End If
If Option7 = True Then
Fi = 0.78
End If
If Option8 = True Then
Fi = 0.88
End If
End If

If List1.Text = "Cultivator" Then
If Option6 = True Then
Fi = 1#
End If
If Option7 = True Then
Fi = 0.65
End If
If Option8 = True Then
Fi = 0.85
End If
End If

'A B C of ASAE Draft Model
A = Val(Implement_specification.Text8.Text)
B = Val(Implement_specification.Text9.Text)
C = Val(Implement_specification.Text10.Text)

'width in ASAE draft model
If Front_screen.List1.Text = "Cultivator" Then
width = Val(Implement_specification.Text3.Text)
Else
width = Val(Implement_specification.Text4.Text)
End If

' depth, speed, cone index
depth = Val(Front_screen.Combo1.Text)
speed = Val(Front_screen.Combo2.Text)
machine_width = Val(Implement_specification.Text4.Text)
CI = Val(Front_screen.Combo3.Text)

'Implement specification
width = Val(Implement_specification.Text4.Text)  ' implement width
Wm = Val(Implement_specification.Text5.Text) ' implement weight kg
CGm = Val(Implement_specification.Text6.Text) ' implement cg from hitch point
ratio_force = Val(Implement_specification.Text7.Text) ' Vertical/Horizontal force

'Tractor specification

Ppto = Val(Tractor_specification.Text4.Text)  ' PTO Power, kW
rpm = Val(Tractor_specification.Text5.Text)   ' Rated engine speed, rpm
Torque_max = Val(Tractor_specification.Text6.Text)  ' max toque, Nm

Wb = Val(Tractor_specification.Text7.Text) ' wheel base, m
TW = Val(Tractor_specification.Text16.Text)  ' Tractor wt, kg
CGd = Val(Tractor_specification.Text17.Text) ' CG from rear axle centre, m
Hd = Val(Tractor_specification.Text18.Text) ' Hitch point away from rear axle, m
rf = Val(Tractor_specification.Text19.Text) ' front wheel rolling radius, m
rr = Val(Tractor_specification.Text20.Text) ' rear wheel rolling radius, m
bwf = Val(Tractor_specification.Text10.Text) ' section width front wheel, inch
bwr = Val(Tractor_specification.Text13.Text) ' section width rear wheel, inch
dwf = Val(Tractor_specification.Text12.Text) ' front wheel nominal dia, inch
dwr = Val(Tractor_specification.Text15.Text) ' rear wheel nominal dia, inch

SWf = bwf * 0.0254
SWr = bwr * 0.0254
ODf = (1.5 * bwf + 1.06 * dwf) * 0.0254        ' Overall diameter front wheel, m
ODr = (1.5 * bwr + 1.06 * dwr) * 0.0254        ' Overall diameter rear wheel, m

'asae draft model
If Front_screen.List1.Text = "Cultivator" Then
width = Val(Implement_specification.Text3.Text)
Else
width = Val(Implement_specification.Text4.Text)
End If

Draft = Fi * (A + B * speed + C * speed * speed) * width * depth

 ' tractor performance
 '''''''''''''''''''''''''''''''''''''
slip = 2# ' initial assumption
RRr1 = 0.04              ' Motion resistance ratio, rear
RRf1 = 0.04              ' Motion resistance ratio, front
 defelction_ratio = 0.2   ' assumed del/h
Do
Do
ef = RRf1 * rf
Py = ratio_force * Draft    ' vertical force
RRr2 = RRr1                      ''''''
RRf2 = RRf1                      '''''''
Temp1 = (TW * 9.81) * (CGd - er)
Temp2 = Draft * depth * 0.01 * 2 / 3
Temp3 = (Py + (Wm * 9.81)) * (CGm + Hd + er)
Temp4 = Wb + ef - er
Fd = (Temp1 + Temp2 - Temp3) / Temp4
Rd = ((TW + Wm) * 9.81) + Py - Fd
If (Rd < 0) Then
MsgBox (" Reduce speed or depth of operation")
End If

'NT1 = Draft / Rd
Bnr = ((2000 * CI * SWr * ODr) / Rd) * (2 / (1 + 3 * SWr / ODr))
Bnf = ((2000 * CI * SWf * ODf) / Fd) * (2 / (1 + 3 * SWf / ODf))
RRr1 = (1 / Bnr) + 0.04 + ((0.005 * slip) / (Bnr ^ 0.5))
RRf1 = (1 / Bnf) + 0.04
Loop While (RRr1 - RRr2) > 0.0001

GT = 0.88 * (1 - Exp(-0.1 * Bnr)) * (1 - Exp(-7.5 * 0.01 * slip)) + 0.04
NT2 = GT - (RRr + RRf)
Pull_st = NT2 * Rd
slip = slip + 0.1
Loop While (Pull_st < Draft)
MR = RRr1 + RRf1 ' total mostion resistance ratio
TE = (100 - slip) * (GT - MR) / GT ' tractive efficiency
Kwf = Fd / (TW * 9.81) ' front weight utilization factor
Kwr = Rd / (TW * 9.81) ' Rear weight utilization factor
                              
'drawbar power required
Pdb = Draft * speed / 3.6 / 1000


''''''''''''''''Field Efficiency''''''''''''''
' theoretical field capacity
FC_th = speed * machine_width / 10
Dim turning_time, total_turning_time, total_time, time_t As Double
Dim number_turn As Integer
width_f = Val(Front_screen.Text2.Text)
area = Val(Front_screen.Text3.Text)
turning_time = 15.56 + 2.61 * (machine_width / speed) - 1.41 * speed ' turning time for one turn in second
number_turn = width_f / machine_width  'no of turn for 180 degree in integer
number_turn = Format(number_turn, "#")
total_turning_time = (turning_time * 2 * number_turn) / 3600 ' total turning time in hour

time_t = area / FC_th ' theoretical tilling time in hour
total_time = total_turning_time + time_t ' total plowing time
FC_ac = area / total_time ' ha/h
Field_eff = FC_ac / FC_th * 100  ' field effieciency in %
 
area = Val(Front_screen.Text3.Text)
trans_eff = Val(Front_screen.Text5.Text)
Pow_res = Val(Front_screen.Text4.Text)                '0.83 = pto/Engine, 0.94= trasmission eff.
Pow_av = Ppto * (trans_eff / 100) * (TE / 100) * ((100 - Pow_res) / 100)
Pused = (Pdb / Pow_av) * 100  ' percentage of power used '0.8 = power reserve

' Ballast Management

If (Kwf < 0.2) Then
RFWD = 0.2 * (TW * 9.81)
BALLAST_F = (RFWD - Fd) / 9.81 ' ballast at front, kg
Else
BALLAST_F = 0
End If

 
 ' Calculation of rear ballast
 
 If (slip <= 7.9) Then
 Results.Label17.Caption = " Increase depth or speed of operation, Because slip is less than 8%"
 Results.Frame5.Visible = False
 Else
   If (slip >= 8 And slip <= 15) Then
    Results.Label17.Caption = " You are working in optimum slip range, 8 to 15 %"
    Results.Frame5.Visible = False
   End If
   If (slip > 15#) Then
    Results.Frame5.Visible = True
     Rd3 = Rd
       Do
        slip3 = 15
        Bnr3 = ((2000 * CI * SWr * ODr) / Rd3) * (2 / (1 + 3 * SWr / ODr))
        RRr3 = (1 / Bnr3) + 0.04 + ((0.005 * slip3) / (Bnr3 ^ 0.5))
        GT3 = 0.88 * (1 - Exp(-0.1 * Bnr3)) * (1 - Exp(-7.5 * 0.01 * slip3)) + 0.04
        TE3 = (1 - RRr3 / GT3) * ((100 - slip3) / 100) * 100
           If (TE3 < 0) Then
              MsgBox "Either decrease depth or speed of operation, Since Slip is very less."
              Exit Sub
            End If
          CRWD = Draft * (100 - slip3) / 100 / (GT3 * TE3 / 100)   'in N
          If ((CRWD - Rd3) > 5) Then
               Rd3 = Rd3 + 5
               Else
               Exit Do
           End If
         Loop
       Results.Label17.Caption = " Ballast is required to reduce the slip upto 15% so that max tractor power can be used"
     End If
      BALLAST_R = (CRWD - Rd) / 9.81
       If (BALLAST_R < 0) Then
        BALLAST_R = -BALLAST_R
       End If
        
    If (slip > 15#) Then
      NT3 = Draft / CRWD
      TE3 = NT3 / GT3 * (100 - slip)
      Else
      BALLAST_R = 0#
    End If
   End If


' fuel consumption (l/h) accrd to ASAE
Dim X, BSFC, Fuel_cons, over_perf   As Double
X = (Pdb / ((trans_eff / 100) * (TE / 100))) / Ppto
SFC = ((2.64 * X + 3.91) - (0.203 * (738 * X + 173) ^ 0.5)) ' Fuel consumption l/kW-h
Fuel_cons = SFC * Pdb / FC_ac            ' Fuel consumption l/ha
'overall performance
over_perf = Pdb * 3600 / 1000 / (FC_th * Fuel_cons * 35.5) * 100            ' 35 is CV of Diesel

'Power utilization summary
If Pused > 90 And Pused < 95 Then
Results.Label27(0).Caption = "Properly Loaded"
Else
If Pused < 90 Then
Results.Label27(0).Caption = "Under Loaded"
Else
Results.Label27(0).Caption = "Over Loaded"
End If
End If
Me.Hide
Results.Show
With Results
.Text1.Text = Format(Draft / 1000, " 0.00")
.Text2.Text = Format(Pdb, "  0.00")
.Text3.Text = Format(slip, "  0.0")
.Text4.Text = Format(NT2, "  0.00")
.Text5.Text = Format(MR, "  0.00")
.Text6.Text = Format(TE, "  0.0")
.Text7.Text = Format(Kwf, "  0.00")
.Text8.Text = Front_screen.Label11.Caption
.Text9.Text = Format(Ppto, "  0.00")
.Text10.Text = Format(FC_th, "  0.00")
.Text11.Text = Format(Field_eff, " 00.0")
.Text12.Text = Format(FC_ac, " 00.0")
.Text13.Text = Format(area, "  00.00")
.Text14.Text = Format(total_time, " .00")
.Text15.Text = Format(Pused, " 00.00")
.Text16(1).Text = Format(BALLAST_R, "0.00")
.Text17.Text = Format(BALLAST_F, "0.00")
.Text18(1).Text = Format(slip3, "0.00")
.Text19(0).Text = Format(NT3, "0.00")
.Text20(0).Text = Format(TE3, "0.00")
.Text21.Text = Format(over_perf, "0.00")
.Text22.Text = Format(SFC, "0.00")
.Text23.Text = Format(Fuel_cons, "0.00")
End With
End Sub

Private Sub Command7_Click()
Me.Hide
Implement_specification.Show
End Sub

Private Sub Command8_Click()
Me.Hide
Tractor_specification.Show
End Sub

Private Sub Form_Load()
'depth
Combo1.Clear
Combo1.AddItem " 10"
Combo1.AddItem " 11"
Combo1.AddItem " 12"
Combo1.AddItem " 13"
Combo1.AddItem " 14"
Combo1.AddItem " 15"
Combo1.AddItem " 16"
Combo1.AddItem " 17"
Combo1.AddItem " 18"
Combo1.AddItem " 19"
Combo1.AddItem " 20"
Combo1.AddItem " 21"
Combo1.AddItem " 22"
Combo1.AddItem " 23"
Combo1.AddItem " 24"
Combo1.AddItem " 25"

'speed
Combo2.Clear
Combo2.AddItem " 2"
Combo2.AddItem " 2.5"
Combo2.AddItem " 3"
Combo2.AddItem " 3.5"
Combo2.AddItem " 4"
Combo2.AddItem " 4.5"
Combo2.AddItem " 5"
Combo2.AddItem " 5.5"
Combo2.AddItem " 6"
Combo2.AddItem " 6.5"
Combo2.AddItem " 7"
Combo2.AddItem " 7.5"
End Sub



Private Sub Option1_Click()
List1.Clear
List2.Clear
List1.AddItem "MB Plough"
List1.AddItem "Disc Plough"
List1.AddItem "Cultivator"
List1.AddItem "Disc Harrow"
MsgBox ("select implement")
End Sub

Private Sub Option10_Click()
MsgBox ("Cone index is between 1200 and 1799 kPa")
Combo3.Clear
Combo3.AddItem "1200"
Combo3.AddItem "1300"
Combo3.AddItem "1400"
Combo3.AddItem "1500"
Combo3.AddItem "1600"
Combo3.AddItem "1700"
End Sub

Private Sub Option11_Click()
MsgBox ("Cone index is between 900 and 1199 kPa")
Combo3.Clear
Combo3.AddItem "900"
Combo3.AddItem "1000"
Combo3.AddItem "1100"
End Sub

Private Sub Option12_Click()
MsgBox ("Cone index is between 450 and 899 kPa")
Combo3.Clear
Combo3.AddItem "450"
Combo3.AddItem "500"
Combo3.AddItem "550"
Combo3.AddItem "600"
Combo3.AddItem "650"
Combo3.AddItem "700"
Combo3.AddItem "750"
Combo3.AddItem "800"
Combo3.AddItem "850"
End Sub

Private Sub Option2_Click()
List1.Clear
List2.Clear
List1.AddItem "Disc Harrow"
List1.AddItem "Cultivator"
MsgBox ("select implement")
End Sub

Private Sub Option3_Click()
List3.Clear
List4.Clear
List3.AddItem "Captain"
List3.AddItem "Mitsubishi"
List3.AddItem "Eicher"
List3.AddItem "M & M"
List3.AddItem "PTL"
List3.AddItem "HMT"
List3.AddItem "Sonalika"
List3.AddItem "Bajaj Tempo"
List3.AddItem "TAFE"
List3.AddItem "Escort"
List3.AddItem "SAME Greaves"
List3.AddItem "Indofarm"
List3.AddItem "L&T John Deere"
MsgBox ("select tractor make")
End Sub

Private Sub Option4_Click()
List3.Clear
List4.Clear
List3.AddItem "M & M"
List3.AddItem "PTL"
List3.AddItem "Eicher"
List3.AddItem "Escort"
List3.AddItem "HMT"
List3.AddItem "TAFE"
List3.AddItem "SAME Greaves"
List3.AddItem "Ford"
List3.AddItem "Sonalika"
List3.AddItem "Bajaj Tempo"
List3.AddItem "L&T John Deere"
List3.AddItem "Indofarm"
MsgBox ("select tractor make")
End Sub

Private Sub Option5_Click()
List3.Clear
List4.Clear
List3.AddItem "Sonalika"
List3.AddItem "SAME Greaves"
List3.AddItem "Ford"
List3.AddItem "Eicher"
List3.AddItem "HMT"
List3.AddItem "TAFE"
List3.AddItem "M & M"
List3.AddItem "Escort"
List3.AddItem "L&T John Deere"
MsgBox ("select tractor make")
End Sub
Private Sub Option9_Click()
MsgBox ("Cone index is more than 1800 kPa")
Combo3.Clear
Combo3.AddItem "1800"
Combo3.AddItem "1900"
Combo3.AddItem "2000"
Combo3.AddItem "2100"
Combo3.AddItem "2200"
Combo3.AddItem "2300"
Combo3.AddItem "2400"
Combo3.AddItem "2500"
End Sub

