VERSION 5.00
Begin VB.Form Tractor_specification 
   BackColor       =   &H00C0FFC0&
   Caption         =   "Tractor"
   ClientHeight    =   7350
   ClientLeft      =   60
   ClientTop       =   450
   ClientWidth     =   8145
   LinkTopic       =   "Form2"
   ScaleHeight     =   7350
   ScaleWidth      =   8145
   StartUpPosition =   3  'Windows Default
   Begin VB.Frame Frame1 
      BackColor       =   &H0080FF80&
      Caption         =   "Tractor Specifications"
      Height          =   6735
      Left            =   360
      TabIndex        =   0
      Top             =   120
      Width           =   7215
      Begin VB.CommandButton Command2 
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
         Left            =   6000
         TabIndex        =   40
         Top             =   6360
         Width           =   975
      End
      Begin VB.Frame Frame5 
         BackColor       =   &H0080FF80&
         Caption         =   "Tire"
         Height          =   1095
         Left            =   120
         TabIndex        =   26
         Top             =   3360
         Width           =   6975
         Begin VB.CommandButton Command1 
            Caption         =   "Tire Specifications"
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
            TabIndex        =   39
            Top             =   720
            Width           =   2415
         End
         Begin VB.TextBox Text15 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   4680
            TabIndex        =   34
            Text            =   "Text15"
            Top             =   480
            Width           =   735
         End
         Begin VB.TextBox Text14 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   4320
            TabIndex        =   33
            Text            =   "Text14"
            Top             =   480
            Width           =   375
         End
         Begin VB.TextBox Text13 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   3360
            TabIndex        =   32
            Text            =   "Text13"
            Top             =   480
            Width           =   735
         End
         Begin VB.TextBox Text12 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   1680
            TabIndex        =   30
            Text            =   "Text12"
            Top             =   480
            Width           =   735
         End
         Begin VB.TextBox Text11 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   960
            TabIndex        =   29
            Text            =   "Text11"
            Top             =   480
            Width           =   375
         End
         Begin VB.TextBox Text10 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   120
            TabIndex        =   28
            Text            =   "Text10"
            Top             =   480
            Width           =   735
         End
         Begin VB.Label Label17 
            BackColor       =   &H0080FF80&
            Caption         =   "Rear Tire Size"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   3960
            TabIndex        =   31
            Top             =   240
            Width           =   1215
         End
         Begin VB.Label Label16 
            BackColor       =   &H0080FF80&
            Caption         =   "Front Tire Size"
            BeginProperty Font 
               Name            =   "Arial"
               Size            =   8.25
               Charset         =   0
               Weight          =   400
               Underline       =   0   'False
               Italic          =   0   'False
               Strikethrough   =   0   'False
            EndProperty
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   480
            TabIndex        =   27
            Top             =   240
            Width           =   2175
         End
      End
      Begin VB.Frame Frame4 
         BackColor       =   &H0080FF80&
         Height          =   1815
         Left            =   120
         TabIndex        =   15
         Top             =   4440
         Width           =   6975
         Begin VB.TextBox Text20 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00C00000&
            Height          =   285
            Left            =   6000
            TabIndex        =   42
            Text            =   "Text20"
            Top             =   1080
            Width           =   855
         End
         Begin VB.TextBox Text18 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00C00000&
            Height          =   285
            Left            =   4320
            TabIndex        =   36
            Text            =   "Text18"
            Top             =   600
            Width           =   1095
         End
         Begin VB.TextBox Text19 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00C00000&
            Height          =   285
            Left            =   2880
            TabIndex        =   35
            Text            =   "Text19"
            Top             =   1080
            Width           =   735
         End
         Begin VB.TextBox Text17 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00C00000&
            Height          =   285
            Left            =   5760
            TabIndex        =   19
            Text            =   "Text17"
            Top             =   240
            Width           =   1095
         End
         Begin VB.TextBox Text16 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00C00000&
            Height          =   285
            Left            =   2040
            TabIndex        =   17
            Text            =   "Text16"
            Top             =   240
            Width           =   975
         End
         Begin VB.Label Label7 
            BackColor       =   &H0080FF80&
            Caption         =   "Rear wheel rolling radius, m"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   3960
            TabIndex        =   41
            Top             =   1080
            Width           =   1935
         End
         Begin VB.Label Label13 
            BackColor       =   &H0080FF80&
            Caption         =   "Hitch point away from rear axle, m"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   1560
            TabIndex        =   38
            Top             =   600
            Width           =   2775
         End
         Begin VB.Label Label15 
            BackColor       =   &H0080FF80&
            Caption         =   "Front wheel rolling radius, m"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   720
            TabIndex        =   37
            Top             =   1080
            Width           =   2175
         End
         Begin VB.Label Label12 
            BackColor       =   &H0080FF80&
            Caption         =   "CG away from rear axle, m"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   3720
            TabIndex        =   18
            Top             =   240
            Width           =   1935
         End
         Begin VB.Label Label11 
            BackColor       =   &H0080FF80&
            Caption         =   "Tractor weight, kg"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   600
            TabIndex        =   16
            Top             =   240
            Width           =   1455
         End
      End
      Begin VB.Frame Frame3 
         BackColor       =   &H0080FF80&
         Height          =   2055
         Left            =   3600
         TabIndex        =   8
         Top             =   1320
         Width           =   3495
         Begin VB.TextBox Text9 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   375
            Left            =   2400
            TabIndex        =   14
            Text            =   "Text9"
            Top             =   1200
            Width           =   855
         End
         Begin VB.TextBox Text8 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   375
            Left            =   2400
            TabIndex        =   12
            Text            =   "Text8"
            Top             =   744
            Width           =   855
         End
         Begin VB.TextBox Text7 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   375
            Left            =   2400
            TabIndex        =   10
            Text            =   "Text7"
            Top             =   360
            Width           =   855
         End
         Begin VB.Label Label10 
            BackColor       =   &H0080FF80&
            Caption         =   "Static weight on rear axle, kg"
            ForeColor       =   &H00800000&
            Height          =   375
            Left            =   120
            TabIndex        =   13
            Top             =   1200
            Width           =   2295
         End
         Begin VB.Label Label9 
            BackColor       =   &H0080FF80&
            Caption         =   "Static weight on front axle, kg"
            ForeColor       =   &H00800000&
            Height          =   375
            Left            =   120
            TabIndex        =   11
            Top             =   720
            Width           =   2295
         End
         Begin VB.Label Label8 
            BackColor       =   &H0080FF80&
            Caption         =   "Wheel base, m"
            ForeColor       =   &H00800000&
            Height          =   375
            Left            =   120
            TabIndex        =   9
            Top             =   360
            Width           =   1935
         End
      End
      Begin VB.Frame Frame2 
         BackColor       =   &H0080FF80&
         Height          =   2055
         Left            =   120
         TabIndex        =   7
         Top             =   1320
         Width           =   3495
         Begin VB.TextBox Text6 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   2520
            TabIndex        =   22
            Text            =   "Text6"
            Top             =   1240
            Width           =   855
         End
         Begin VB.TextBox Text5 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   2520
            TabIndex        =   21
            Text            =   "Text5"
            Top             =   800
            Width           =   855
         End
         Begin VB.TextBox Text4 
            BackColor       =   &H00C0FFC0&
            ForeColor       =   &H00FF0000&
            Height          =   285
            Left            =   2520
            TabIndex        =   20
            Text            =   "Text4"
            Top             =   360
            Width           =   855
         End
         Begin VB.Label Label6 
            BackColor       =   &H0080FF80&
            Caption         =   "Maximum engine torque, N-m"
            ForeColor       =   &H00800000&
            Height          =   495
            Left            =   0
            TabIndex        =   25
            Top             =   1240
            Width           =   2535
         End
         Begin VB.Label Label5 
            BackColor       =   &H0080FF80&
            Caption         =   "Rated engine speed, rpm"
            ForeColor       =   &H00800000&
            Height          =   495
            Left            =   0
            TabIndex        =   24
            Top             =   800
            Width           =   2535
         End
         Begin VB.Label Label4 
            BackColor       =   &H0080FF80&
            Caption         =   "PTO power, kW"
            ForeColor       =   &H00800000&
            Height          =   255
            Left            =   0
            TabIndex        =   23
            Top             =   360
            Width           =   1575
         End
      End
      Begin VB.TextBox Text3 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H000000FF&
         Height          =   375
         Left            =   4920
         TabIndex        =   3
         Text            =   "Text3"
         Top             =   600
         Width           =   2055
      End
      Begin VB.TextBox Text2 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H000000FF&
         Height          =   375
         Left            =   2640
         TabIndex        =   2
         Text            =   "Text2"
         Top             =   600
         Width           =   1815
      End
      Begin VB.TextBox Text1 
         BackColor       =   &H00FFFFC0&
         ForeColor       =   &H000000FF&
         Height          =   375
         Left            =   240
         TabIndex        =   1
         Text            =   "Text1"
         Top             =   600
         Width           =   735
      End
      Begin VB.Label Label3 
         BackColor       =   &H0080FF80&
         Caption         =   "Model"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   8.25
            Charset         =   0
            Weight          =   700
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   5520
         TabIndex        =   6
         Top             =   360
         Width           =   735
      End
      Begin VB.Label Label2 
         BackColor       =   &H0080FF80&
         Caption         =   "Make"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   8.25
            Charset         =   0
            Weight          =   700
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   3000
         TabIndex        =   5
         Top             =   360
         Width           =   1095
      End
      Begin VB.Label Label1 
         BackColor       =   &H0080FF80&
         Caption         =   "Drive Mode"
         BeginProperty Font 
            Name            =   "MS Sans Serif"
            Size            =   8.25
            Charset         =   0
            Weight          =   700
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   240
         TabIndex        =   4
         Top             =   360
         Width           =   1095
      End
   End
End
Attribute VB_Name = "Tractor_specification"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Private Sub Command1_Click()
Me.Hide
Tire_specification.Show
End Sub

Private Sub Command2_Click()
Me.Hide
Front_screen.Show
End Sub
