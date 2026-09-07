VERSION 5.00
Begin VB.Form Opening_screen 
   BackColor       =   &H00FFFFC0&
   Caption         =   "Form1"
   ClientHeight    =   9360
   ClientLeft      =   60
   ClientTop       =   345
   ClientWidth     =   14625
   LinkTopic       =   "Form1"
   LockControls    =   -1  'True
   ScaleHeight     =   9360
   ScaleWidth      =   14625
   StartUpPosition =   2  'CenterScreen
   WindowState     =   2  'Maximized
   Begin VB.CommandButton Command1 
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   18
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   735
      Left            =   11520
      Picture         =   "Opening_screen.frx":0000
      Style           =   1  'Graphical
      TabIndex        =   6
      Top             =   8400
      Width           =   1935
   End
   Begin VB.Label Label6 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00FFFFC0&
      Caption         =   "Developer: R. K. Maheshwari and Dr. H. Raheman"
      BeginProperty Font 
         Name            =   "Times New Roman"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00004040&
      Height          =   255
      Left            =   720
      TabIndex        =   5
      Top             =   8400
      Width           =   5895
   End
   Begin VB.Label Label7 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00FFFFC0&
      Caption         =   "Agricultural and Food Engineering Department"
      BeginProperty Font 
         Name            =   "Times New Roman"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00004040&
      Height          =   375
      Left            =   2640
      TabIndex        =   4
      Top             =   8760
      Width           =   4695
   End
   Begin VB.Label Label8 
      Alignment       =   1  'Right Justify
      BackColor       =   &H00FFFFC0&
      Caption         =   "Indian Institute of Technology, Kharagpur"
      BeginProperty Font 
         Name            =   "Times New Roman"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00004040&
      Height          =   375
      Left            =   2400
      TabIndex        =   3
      Top             =   9120
      Width           =   4455
   End
   Begin VB.Image Image1 
      Height          =   2055
      Left            =   11280
      Picture         =   "Opening_screen.frx":448E
      Stretch         =   -1  'True
      ToolTipText     =   """Wish to select an implement"""
      Top             =   4680
      Width           =   2385
   End
   Begin VB.Image Image8 
      Height          =   2085
      Left            =   1200
      Picture         =   "Opening_screen.frx":2E938
      Stretch         =   -1  'True
      ToolTipText     =   """Wish to select an implement"""
      Top             =   3960
      Width           =   2400
   End
   Begin VB.Image Image7 
      Height          =   2655
      Left            =   6600
      Picture         =   "Opening_screen.frx":4D23A
      Stretch         =   -1  'True
      ToolTipText     =   """Wish to select  an implement for your tractor """
      Top             =   4440
      Width           =   3255
   End
   Begin VB.Shape Shape8 
      BorderWidth     =   3
      Height          =   3615
      Left            =   5520
      Shape           =   2  'Oval
      Top             =   3960
      Width           =   5295
   End
   Begin VB.Image Image3 
      Height          =   1920
      Left            =   10680
      Picture         =   "Opening_screen.frx":69213
      Stretch         =   -1  'True
      ToolTipText     =   "Agricultural and Food Engineering Department"
      Top             =   1440
      Width           =   2505
   End
   Begin VB.Image Image5 
      Height          =   2055
      Left            =   3600
      Picture         =   "Opening_screen.frx":6C964
      Stretch         =   -1  'True
      ToolTipText     =   "Indian Institute of Technology, Kharagpur, India"
      Top             =   1440
      Width           =   2505
   End
   Begin VB.Label Label2 
      Alignment       =   2  'Center
      BackColor       =   &H00404000&
      Caption         =   "Indian Institute of Technology Kharagpur, India"
      BeginProperty Font 
         Name            =   "Times New Roman"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFC0&
      Height          =   495
      Left            =   3600
      TabIndex        =   2
      Top             =   3480
      Width           =   2535
   End
   Begin VB.Label Label3 
      Alignment       =   2  'Center
      BackColor       =   &H00404000&
      Caption         =   "Agricultural and Food Engineering Department"
      BeginProperty Font 
         Name            =   "Times New Roman"
         Size            =   9
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00C0FFC0&
      Height          =   495
      Left            =   10680
      TabIndex        =   1
      Top             =   3360
      Width           =   2535
   End
   Begin VB.Label Label19 
      Alignment       =   2  'Center
      BackColor       =   &H00004040&
      BackStyle       =   0  'Transparent
      Caption         =   "Decision Support System for Performance Prediction of Tractor and Implement  System"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   15.75
         Charset         =   0
         Weight          =   700
         Underline       =   -1  'True
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H008080FF&
      Height          =   735
      Left            =   -120
      TabIndex        =   0
      Top             =   480
      Width           =   14535
   End
End
Attribute VB_Name = "Opening_screen"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

Private Sub Command1_Click()
Me.Hide
Front_screen.Show
End Sub
