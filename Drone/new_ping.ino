#include <EEPROM.h>
#include <Servo.h>
#include <NewPing.h>

#define trig_pin 7
#define echo_pin 8
#define led_pin 2
#define MAX_SIGNAL 1860
#define MIN_SIGNAL 900
#define MOTOR_PIN 9
#define BUTTON 13
#define soil_sensor A0 
int soil_value = 0 ;
int x = 0; //x is a counter to make sure values are consistent
int i = 0;
long int data = 0;
byte final = 0;
int flag = 0;
int addr = 0;

Servo motor;

NewPing sonar(trig_pin, echo_pin);
 
void setup() {
  Serial.begin(115200);
  pinMode(led_pin, OUTPUT);
  digitalWrite(led_pin, HIGH);
  for (int i = 0 ; i < EEPROM.length() ; i++) {
    EEPROM.write(i, 255);
  }
  
  pinMode(BUTTON, INPUT);
  Serial.println("Program begin...");
  Serial.println("This program will calibrate the ESC.");

  motor.attach(MOTOR_PIN);

  Serial.println("Now writing maximum output.");
  Serial.println("Turn on power source, then wait 2 seconds and press any key.");
  motor.writeMicroseconds(MAX_SIGNAL);

  // Wait for input
  while (!Serial.available());
  Serial.read();

  // Send min output
  Serial.println("Sending minimum output");
  motor.writeMicroseconds(MIN_SIGNAL);

  delay(5000);
  motor.writeMicroseconds(1050);
}
 
void loop() {
  delay(50);
  int dist = sonar.ping_in();
  Serial.print(dist);
  Serial.println("in");
  
 /* if (digitalRead(BUTTON) == HIGH) {
    disarm();
  }*/

  if (dist < 5 && dist > 0) {
    x++ ;
    if (x >= 2) {
      digitalWrite(led_pin, LOW);
      motor.writeMicroseconds(800);
      for (i = 1; i <= 50; i++) {
        data += soil();
      }
      final = data / i;
      EEPROM.write(addr, data);
      addr ++ ;
      motor.writeMicroseconds(1050);
      digitalWrite(led_pin, HIGH);
      Serial.print("The soil moisture value is: ");
      Serial.print(final);
      Serial.println(" out of 200.");
      x = 0;
      data = 0;
      delay(5000);
    } 
  }

  else {
    x = 0;
  }

}

/*void arm() {
  Serial.println("Program begin...");
  Serial.println("This program will calibrate the ESC.");

  motor.attach(MOTOR_PIN);

  Serial.println("Now writing maximum output.");
  Serial.println("Turn on power source, then wait 2 seconds and press any key.");
  motor.writeMicroseconds(MAX_SIGNAL);

  // Wait for input
  while (!Serial.available());
  Serial.read();

  // Send min output
  Serial.println("Sending minimum output");
  motor.writeMicroseconds(MIN_SIGNAL);

}*/

void disarm() {
  delay(2000);
  motor.writeMicroseconds(0);
  while (digitalRead(BUTTON) == LOW) { };
  
  Serial.println("Program begin...");
  Serial.println("This program will calibrate the ESC.");

  motor.attach(MOTOR_PIN);

  Serial.println("Now writing maximum output.");
  Serial.println("Turn on power source, then wait 2 seconds and press any key.");
  motor.writeMicroseconds(MAX_SIGNAL);

  // Wait for input
  //while (!Serial.available());
  //Serial.read();
  delay(2500);

  // Send min output
  Serial.println("Sending minimum output");
  motor.writeMicroseconds(MIN_SIGNAL);
}

int soil() {
  soil_value = analogRead(soil_sensor);
  soil_value /= 5;
  Serial.print("the soil sensor reading is ");
  Serial.println(soil_value);
  delay(100);
  return soil_value;
}
