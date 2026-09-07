VERSION 5.00
Begin VB.Form Implement_specification 
   BackColor       =   &H00C0FFC0&
   Caption         =   "Implement"
   ClientHeight    =   5985
   ClientLeft      =   60
   ClientTop       =   450
   ClientWidth     =   7275
   DrawStyle       =   5  'Transparent
   ForeColor       =   &H80000013&
   LinkTopic       =   "Form2"
   ScaleHeight     =   5985
   ScaleWidth      =   7275
   StartUpPosition =   3  'Windows Default
   Begin VB.CommandButton Command1 
      BackColor       =   &H0000FF00&
      Caption         =   "Back"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   8.25
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   375
      Left            =   5400
      TabIndex        =   23
      Top             =   5400
      Width           =   1335
   End
   Begin VB.Frame Frame3 
      BackColor       =   &H00C0FFFF&
      Caption         =   "ASAE Parameters"
      Height          =   3615
      Left            =   4440
      TabIndex        =   16
      Top             =   960
      Width           =   1695
      Begin VB.TextBox Text10 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   480
         TabIndex        =   22
         Text            =   "Text10"
         Top             =   1800
         Width           =   855
      End
      Begin VB.TextBox Text9 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   480
         TabIndex        =   21
         Text            =   "Text9"
         Top             =   960
         Width           =   855
      End
      Begin VB.TextBox Text8 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   480
         TabIndex        =   20
         Text            =   "Text8"
         Top             =   360
         Width           =   855
      End
      Begin VB.Label Label10 
         BackColor       =   &H00C0FFFF&
         Caption         =   "C"
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   120
         TabIndex        =   19
         Top             =   1800
         Width           =   255
      End
      Begin VB.Label Label9 
         BackColor       =   &H00C0FFFF&
         Caption         =   "B"
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   120
         TabIndex        =   18
         Top             =   1080
         Width           =   255
      End
      Begin VB.Label Label8 
         BackColor       =   &H00C0FFFF&
         Caption         =   "A"
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   120
         TabIndex        =   17
         Top             =   360
         Width           =   255
      End
   End
   Begin VB.Frame Frame2 
      BackColor       =   &H00C0FFFF&
      Caption         =   "Implement Parameters"
      Height          =   3615
      Left            =   480
      TabIndex        =   3
      Top             =   960
      Width           =   3975
      Begin VB.TextBox Text7 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   2640
         TabIndex        =   15
         Text            =   "Text7"
         Top             =   3000
         Width           =   975
      End
      Begin VB.TextBox Text6 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   2640
         TabIndex        =   10
         Text            =   "Text6"
         Top             =   2520
         Width           =   975
      End
      Begin VB.TextBox Text5 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   2640
         TabIndex        =   9
         Text            =   "Text5"
         Top             =   1920
         Width           =   975
      End
      Begin VB.TextBox Text4 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   2640
         TabIndex        =   8
         Text            =   "Text4"
         Top             =   1440
         Width           =   975
      End
      Begin VB.TextBox Text3 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   2640
         TabIndex        =   6
         Text            =   "Text3"
         Top             =   960
         Width           =   975
      End
      Begin VB.TextBox Text2 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   2640
         TabIndex        =   4
         Text            =   "Text2"
         Top             =   360
         Width           =   975
      End
      Begin VB.Label Label7 
         BackColor       =   &H00C0FFFF&
         Caption         =   "Vertical to Horizontal Force Ratio"
         ForeColor       =   &H00C00000&
         Height          =   375
         Left            =   240
         TabIndex        =   14
         Top             =   3000
         Width           =   2415
      End
      Begin VB.Label Label6 
         BackColor       =   &H00C0FFFF&
         Caption         =   "Implement CG distance from  Tractor Hitch Point, m"
         ForeColor       =   &H00C00000&
         Height          =   375
         Left            =   240
         TabIndex        =   13
         Top             =   2400
         Width           =   2055
      End
      Begin VB.Label Label5 
         BackColor       =   &H00C0FFFF&
         Caption         =   "Implement Weight, kg"
         ForeColor       =   &H00C00000&
         Height          =   255
         Left            =   240
         TabIndex        =   12
         Top             =   1920
         Width           =   1695
      End
      Begin VB.Label Label4 
         BackColor       =   &H00C0FFFF&
         Caption         =   "Implement width, m"
         ForeColor       =   &H00C00000&
         Height          =   255
         Left            =   240
         TabIndex        =   11
         Top             =   1440
         Width           =   1455
      End
      Begin VB.Label Label3 
         BackColor       =   &H00C0FFFF&
         Caption         =   "label 3"
         ForeColor       =   &H00C00000&
         Height          =   255
         Left            =   240
         TabIndex        =   7
         Top             =   960
         Width           =   1815
      End
      Begin VB.Label Label2 
         BackColor       =   &H00C0FFFF&
         Caption         =   "label 2"
         ForeColor       =   &H00C00000&
         Height          =   255
         Left            =   240
         TabIndex        =   5
         Top             =   360
         Width           =   2295
      End
   End
   Begin VB.Frame Frame1 
      BackColor       =   &H00C0FFFF&
      Height          =   735
      Left            =   480
      TabIndex        =   0
      Top             =   240
      Width           =   5655
      Begin VB.TextBox Text1 
         BackColor       =   &H00FFFF80&
         ForeColor       =   &H00C00000&
         Height          =   375
         Left            =   2280
         TabIndex        =   2
         Text            =   "Text1"
         Top             =   240
         Width           =   1455
      End
      Begin VB.Label Label1 
         BackColor       =   &H00C0FFFF&
         Caption         =   "Implement"
         ForeColor       =   &H00C00000&
         Height          =   375
         Left            =   360
         TabIndex        =   1
         Top             =   240
         Width           =   1695
      End
   End
End
Attribute VB_Name = "Implement_specification"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Private Sub Command1_Click()
Me.Hide
Front_screen.Show
End Sub
