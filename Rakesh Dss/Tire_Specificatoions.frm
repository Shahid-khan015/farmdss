VERSION 5.00
Begin VB.Form Tire_specification 
   BackColor       =   &H00C0E0FF&
   Caption         =   "TIRE"
   ClientHeight    =   4860
   ClientLeft      =   60
   ClientTop       =   450
   ClientWidth     =   6510
   LinkTopic       =   "Tire"
   ScaleHeight     =   4860
   ScaleWidth      =   6510
   StartUpPosition =   3  'Windows Default
   Begin VB.CommandButton Command1 
      Caption         =   "Back"
      BeginProperty Font 
         Name            =   "MS Sans Serif"
         Size            =   9.75
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   315
      Left            =   4440
      TabIndex        =   25
      Top             =   4320
      Width           =   1335
   End
   Begin VB.Frame Frame3 
      BackColor       =   &H00C0C0C0&
      Height          =   2655
      Left            =   120
      TabIndex        =   11
      Top             =   840
      Width           =   1695
      Begin VB.TextBox Text18 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   495
         Left            =   720
         TabIndex        =   24
         Text            =   "Text18"
         Top             =   1920
         Width           =   150
      End
      Begin VB.TextBox Text17 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   495
         Left            =   720
         TabIndex        =   23
         Text            =   "Text17"
         Top             =   600
         Width           =   150
      End
      Begin VB.TextBox Text1 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   495
         Left            =   120
         MultiLine       =   -1  'True
         TabIndex        =   15
         Top             =   600
         Width           =   495
      End
      Begin VB.TextBox Text2 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   495
         Left            =   960
         Locked          =   -1  'True
         TabIndex        =   14
         Top             =   600
         Width           =   615
      End
      Begin VB.TextBox Text3 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   495
         Left            =   120
         MultiLine       =   -1  'True
         TabIndex        =   13
         Top             =   1920
         Width           =   495
      End
      Begin VB.TextBox Text4 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   495
         Left            =   960
         TabIndex        =   12
         Top             =   1920
         Width           =   615
      End
      Begin VB.Label Label8 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Front Tire"
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   240
         TabIndex        =   17
         Top             =   240
         Width           =   855
      End
      Begin VB.Label Label10 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Rear Tire"
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   360
         TabIndex        =   16
         Top             =   1560
         Width           =   735
      End
   End
   Begin VB.Frame Frame2 
      BackColor       =   &H00C0C0C0&
      Height          =   2775
      Left            =   1920
      TabIndex        =   4
      Top             =   720
      Width           =   4215
      Begin VB.TextBox Text6 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   2160
         TabIndex        =   28
         Top             =   1080
         Width           =   615
      End
      Begin VB.TextBox Text12 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   3240
         TabIndex        =   27
         Top             =   1080
         Width           =   615
      End
      Begin VB.TextBox Text14 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   3240
         TabIndex        =   20
         Top             =   2040
         Width           =   615
      End
      Begin VB.TextBox Text13 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   3240
         TabIndex        =   19
         Top             =   1560
         Width           =   615
      End
      Begin VB.TextBox Text11 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   3240
         TabIndex        =   18
         Top             =   600
         Width           =   615
      End
      Begin VB.TextBox Text5 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   2160
         TabIndex        =   7
         Top             =   600
         Width           =   615
      End
      Begin VB.TextBox Text7 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   2160
         TabIndex        =   6
         Top             =   1560
         Width           =   615
      End
      Begin VB.TextBox Text8 
         BackColor       =   &H00C0FFFF&
         ForeColor       =   &H00008000&
         Height          =   285
         Left            =   2160
         TabIndex        =   5
         Top             =   2040
         Width           =   615
      End
      Begin VB.Label Label5 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Rolling Radius, mm"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   240
         TabIndex        =   26
         Top             =   2010
         Width           =   1455
      End
      Begin VB.Label Label13 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Rear Tire"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   3120
         TabIndex        =   22
         Top             =   240
         Width           =   855
      End
      Begin VB.Label Label12 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Front Tire"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   2040
         TabIndex        =   21
         Top             =   240
         Width           =   855
      End
      Begin VB.Label Label2 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Overall Diameter, mm"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   240
         TabIndex        =   10
         Top             =   600
         Width           =   1815
      End
      Begin VB.Label Label3 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Section Width, mm"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   240
         TabIndex        =   9
         Top             =   1035
         Width           =   1695
      End
      Begin VB.Label Label4 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Static Loaded Radius, mm"
         ForeColor       =   &H00800000&
         Height          =   375
         Left            =   240
         TabIndex        =   8
         Top             =   1560
         Width           =   1935
      End
   End
   Begin VB.Frame Frame1 
      BackColor       =   &H00C0C0C0&
      Height          =   495
      Left            =   360
      TabIndex        =   0
      Top             =   240
      Width           =   4695
      Begin VB.OptionButton Option2 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Radial Ply"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   3240
         MaskColor       =   &H000000C0&
         TabIndex        =   3
         Top             =   120
         Width           =   1335
      End
      Begin VB.OptionButton Option1 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Bias Ply"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   1560
         MaskColor       =   &H000000C0&
         TabIndex        =   2
         Top             =   120
         Width           =   855
      End
      Begin VB.Label Label1 
         BackColor       =   &H00C0C0C0&
         Caption         =   "Tire type"
         ForeColor       =   &H00800000&
         Height          =   255
         Left            =   360
         TabIndex        =   1
         Top             =   120
         Width           =   975
      End
   End
End
Attribute VB_Name = "Tire_specification"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False

Private Sub Command1_Click()
Me.Hide
Tractor_specification.Show
End Sub
